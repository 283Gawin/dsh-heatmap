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
import type { Context } from '@deepseek-ai/cordis';
import type { HeatmapConfig, HeatmapPayload } from '../core/types.ts';
/** The subprocess seam git runs through. */
export interface GitRunner {
    run(argv: readonly string[], cwd: string): Promise<{
        exitCode: number | null;
        stdout: string;
        stderr: string;
    }>;
}
/** Production git runner over ctx.subprocess. */
export declare function subprocessGitRunner(ctx: Context): GitRunner;
/**
 * The stats service. One instance per plugin application; owns the snapshot
 * cache and the incremental scan state.
 */
export declare class StatsService {
    private readonly persistence;
    private readonly git;
    private readonly config;
    private readonly table;
    private cache;
    private inflight;
    private readonly sessionStates;
    /** Workspace roots discovered from session headers (cwd) plus config extras. */
    private readonly repoRoots;
    constructor(ctx: Context, config: () => HeatmapConfig, git?: GitRunner);
    /** Snapshot with TTL caching; concurrent callers share one scan. */
    snapshot(): Promise<HeatmapPayload>;
    /** Drop the cache (settings changed); the next snapshot rescans. */
    invalidate(): void;
    /** Full incremental scan: changed sessions re-read, new sessions added, git rescanned. */
    private scan;
    /** Re-read only sessions whose durable log changed since the last scan. */
    private scanSessions;
    /** Repo roots: session cwds (deduped, up to a sane cap) plus configured extras. */
    private collectRepos;
}
export declare function setStatsLogger(sink: (message: string) => void): void;
