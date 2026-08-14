/**
 * Host stats service: scans every stored session's durable log for provider
 * token usage (assistant/message events with usage, model attribution from
 * request/header / request/context), scans the workspaces' git repositories
 * for daily commit counts, folds everything into aligned day buckets, and
 * serves a TTL-cached snapshot to the browser half.
 *
 * Reads go through the official `sessionPersistence` service (zstd decoding
 * included), git through the managed `subprocess` seam — no direct file
 * parsing, no source changes.
 * @module dsh-activity-heatmap/host/stats-service
 */

import { stat } from 'node:fs/promises'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type {} from '@deepseek-ai/dsh-subprocess'
import {
  assemblePayload,
  dateKey,
  emptyBuckets,
  foldCommitsInto,
  foldSessionUsages,
  foldSamplesInto,
  parseGitLogDates,
} from '../core/aggregate.ts'
import { resolvePriceTable, type ModelPrice } from '../core/pricing.ts'
import type { HeatmapConfig, HeatmapPayload } from '../core/types.ts'

/** Snapshot freshness window; a scan runs at most once per window. */
const TTL_MS = 60_000
/** Concurrency cap while scanning session logs. */
const SESSION_CONCURRENCY = 4
/** Days the heatmap covers. */
const WINDOW_DAYS = 365
/** Git log output cap (a year of short dates is tiny; 1 MiB is generous). */
const GIT_OUTPUT_CAP = 1 << 20

/** One scanned session: log signature plus folded usage samples. */
interface SessionScanState {
  /** Durable log stat signature (size + mtimeMs) used for incremental re-scans. */
  signature: string
  samples: ReturnType<typeof foldSessionUsages>
}

/** The subprocess seam git runs through. */
export interface GitRunner {
  run(argv: readonly string[], cwd: string): Promise<{ exitCode: number | null; stdout: string; stderr: string }>
}

/** Production git runner over ctx.subprocess. */
export function subprocessGitRunner(ctx: Context): GitRunner {
  return {
    async run(argv, cwd) {
      const handle = ctx.subprocess.spawn({
        argv: ['git', ...argv],
        cwd,
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: GIT_OUTPUT_CAP },
          stderr: { maxBytes: GIT_OUTPUT_CAP },
        },
        graceMs: 15_000,
      })
      const outcome = await handle.done
      return {
        exitCode: outcome.exitCode,
        stdout: handle.collected.stdout?.readFrom(0).text ?? '',
        stderr: handle.collected.stderr?.readFrom(0).text ?? '',
      }
    },
  }
}

/**
 * The stats service. One instance per plugin application; owns the snapshot
 * cache and the incremental scan state.
 */
export class StatsService {
  private readonly persistence: NonNullable<Context['sessionPersistence']>
  private readonly git: GitRunner
  private readonly config: () => HeatmapConfig
  private readonly table: () => Record<string, ModelPrice>
  private cache: { payload: HeatmapPayload; at: number } | undefined
  private inflight: Promise<HeatmapPayload> | undefined
  private readonly sessionStates = new Map<string, SessionScanState>()
  /** Workspace roots discovered from session headers (cwd) plus config extras. */
  private readonly repoRoots = new Set<string>()

  constructor(
    ctx: Context,
    config: () => HeatmapConfig,
    git: GitRunner = subprocessGitRunner(ctx),
  ) {
    this.persistence = ctx.sessionPersistence
    this.config = config
    this.git = git
    this.table = () => resolvePriceTable(config().priceOverrides)
  }

  /** Snapshot with TTL caching; concurrent callers share one scan. */
  async snapshot(): Promise<HeatmapPayload> {
    const cached = this.cache
    if (cached !== undefined && Date.now() - cached.at < TTL_MS) return cached.payload
    if (this.inflight !== undefined) return this.inflight
    this.inflight = this.scan()
      .then((payload) => {
        this.cache = { payload, at: Date.now() }
        return payload
      })
      .finally(() => {
        this.inflight = undefined
      })
    return this.inflight
  }

  /** Drop the cache (settings changed); the next snapshot rescans. */
  invalidate(): void {
    this.cache = undefined
  }

  /** Full incremental scan: changed sessions re-read, new sessions added, git rescanned. */
  private async scan(): Promise<HeatmapPayload> {
    const now = Date.now()
    const days = emptyBuckets(WINDOW_DAYS, now)
    const samples = await this.scanSessions()
    const table = this.table()
    foldSamplesInto(days, samples, table)

    const roots = await this.collectRepos()
    const commitDates: string[] = []
    const since = dateKey(now - (WINDOW_DAYS - 1) * 86_400_000)
    for (const root of roots) {
      const argv = ['log', '--since=' + since + ' 00:00:00', '--date=short', '--pretty=format:%ad']
      if (!(this.config().includeMerges ?? false)) argv.push('--no-merges')
      try {
        const result = await this.git.run(argv, root)
        if (result.exitCode === 0) {
          commitDates.push(...parseGitLogDates(result.stdout))
        }
        // Non-zero (not a repository / no commits) is a normal absence.
      } catch {
        // A failed git run must not take the whole snapshot down.
      }
    }
    foldCommitsInto(days, commitDates)

    const todaySamples = samples.filter((sample) => dateKey(sample.time) === dateKey(now))
    return assemblePayload(days, todaySamples, table, now, this.config().usdCnyRate ?? 0)
  }

  /** Re-read only sessions whose durable log changed since the last scan. */
  private async scanSessions() {
    const headers = await this.persistence.list()
    const all: ReturnType<typeof foldSessionUsages> = []

    // Discover repo roots from headers and refresh per-session signatures.
    const pending: { id: SessionId; signature: string }[] = []
    for (const header of headers) {
      if (typeof header.cwd === 'string' && header.cwd !== '') this.repoRoots.add(header.cwd)
      let signature = ''
      const location = this.persistence.locate(header)
      if (location !== undefined) {
        try {
          const info = await stat(location.path)
          signature = info.size + ':' + info.mtimeMs
        } catch {
          // The log may not be materialized yet; treat as new next round.
        }
      }
      const state = this.sessionStates.get(header.id)
      if (state !== undefined && state.signature === signature) {
        all.push(...state.samples)
        continue
      }
      pending.push({ id: header.id, signature })
    }

    let cursor = 0
    const workers = Array.from({ length: Math.min(SESSION_CONCURRENCY, Math.max(1, pending.length)) }, async () => {
      while (cursor < pending.length) {
        const item = pending[cursor]
        cursor += 1
        try {
          const { events } = await this.persistence.readFrom(item.id, 0)
          const samples = foldSessionUsages(events)
          this.sessionStates.set(item.id, { signature: item.signature, samples })
          all.push(...samples)
        } catch (error) {
          logError('session scan failed for ' + item.id + ': ' + String(error))
        }
      }
    })
    await Promise.all(workers)

    // Drop states for sessions that disappeared.
    const live = new Set(headers.map((header) => String(header.id)))
    for (const id of [...this.sessionStates.keys()]) {
      if (!live.has(id)) this.sessionStates.delete(id)
    }
    return all
  }

  /** Repo roots: session cwds (deduped, up to a sane cap) plus configured extras. */
  private async collectRepos(): Promise<string[]> {
    const roots = [...this.repoRoots]
    for (const extra of this.config().extraRepos ?? []) {
      if (extra !== '' && !roots.includes(extra)) roots.push(extra)
    }
    return roots.slice(0, 64)
  }
}

/** Log sink (swappable for tests). */
let logError: (message: string) => void = (message) => console.error('[dsh-activity-heatmap] ' + message)
export function setStatsLogger(sink: (message: string) => void): void {
  logError = sink
}