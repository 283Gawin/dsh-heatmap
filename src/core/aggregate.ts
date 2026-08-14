/**
 * Pure aggregation folds for the heatmap: session-event usage extraction,
 * per-day bucketing, git log date parsing, and the today summary. All
 * functions are side-effect free so the folds are unit-testable without a
 * session backend.
 * @module dsh-activity-heatmap/core/aggregate
 */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { TokenUsage } from '@deepseek-ai/dsh-llm'
import { billedTokens, costUsd, priceFor, type ModelPrice } from './pricing.ts'
import type { DayUsage, HeatmapPayload, TodayModelRow, TodaySummary } from './types.ts'

/** One provider-reported usage sample with its model attribution. */
export interface UsageSample {
  /** Unix epoch ms of the carrying event. */
  time: number
  inputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
  /** Model id tracked from the nearest request/header or request/context. */
  model: string
}

const UNKNOWN_MODEL = 'unknown'

/** Local calendar-day key for an epoch-ms timestamp ('YYYY-MM-DD'). */
export function dateKey(time: number): string {
  const d = new Date(time)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Fold one session's durable events into usage samples.
 *
 * Provider usage rides `assistant/message` events; the model for each sample
 * is the nearest preceding `request/header` (every step logs one) or
 * `request/context`. A repeated usage for the same turn/step replaces the
 * earlier sample (retry semantics) instead of double counting.
 * @param events - the session's durable events in seq order.
 * @returns usage samples in first-seen turn/step order.
 */
export function foldSessionUsages(events: readonly SessionEvent[]): UsageSample[] {
  let model = UNKNOWN_MODEL
  const latest = new Map<string, UsageSample>()
  for (const event of events) {
    switch (event.type) {
      case 'request/header': {
        const config = event.data.header?.config
        if (config !== undefined && typeof config.model === 'string' && config.model !== '') {
          model = config.model
        }
        break
      }
      case 'request/context': {
        if (typeof event.data.model === 'string' && event.data.model !== '') {
          model = event.data.model
        }
        break
      }
      case 'assistant/message': {
        const usage: TokenUsage | undefined = event.data.usage
        if (usage === undefined) break
        const key = `${event.data.turn}:${event.data.step}`
        latest.set(key, {
          time: event.time,
          inputTokens: usage.inputTokens ?? 0,
          cacheReadTokens: usage.cacheReadTokens ?? 0,
          cacheWriteTokens: usage.cacheWriteTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
          model,
        })
        break
      }
      default:
        break
    }
  }
  return [...latest.values()]
}

/** Merge one usage sample into a day bucket. */
export function mergeSample(day: DayUsage, sample: UsageSample, price: ModelPrice): void {
  day.inputTokens += sample.inputTokens
  day.cacheReadTokens += sample.cacheReadTokens
  day.cacheWriteTokens += sample.cacheWriteTokens
  day.outputTokens += sample.outputTokens
  const usd = costUsd(sample, price)
  day.modelCostUsd[sample.model] = (day.modelCostUsd[sample.model] ?? 0) + usd
}

/** Billed token total for one day (all four components). */
export function billedFor(day: DayUsage): number {
  return day.inputTokens + day.cacheReadTokens + day.cacheWriteTokens + day.outputTokens
}

/**
 * Build a 365-day (or custom-length) bucket array aligned to the local
 * calendar, oldest first, ending today. Buckets are fresh zeroed rows; the
 * caller folds samples and commits into them.
 * @param dayCount - number of days to cover (default 365).
 * @param now - anchor timestamp (defaults to Date.now()).
 */
export function emptyBuckets(dayCount: number, now: number = Date.now()): DayUsage[] {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const days: DayUsage[] = []
  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({
      date: dateKey(d.getTime()),
      inputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      outputTokens: 0,
      commits: 0,
      modelCostUsd: {},
    })
  }
  return days
}

/** Index a bucket array by its date key. */
export function indexBuckets(days: readonly DayUsage[]): Map<string, DayUsage> {
  return new Map(days.map((day) => [day.date, day]))
}

/** Fold all usage samples into the aligned buckets (in place). */
export function foldSamplesInto(
  days: readonly DayUsage[],
  samples: readonly UsageSample[],
  table: Record<string, ModelPrice>,
): void {
  const index = indexBuckets(days)
  for (const sample of samples) {
    const day = index.get(dateKey(sample.time))
    if (day === undefined) continue // older than the window: ignore
    mergeSample(day, sample, table[sample.model] ?? priceFor(sample.model, undefined))
  }
}

/**
 * Parse `git log --date=short --pretty=format:%ad` output into date keys.
 * Non-date lines (warnings, empty lines) are ignored.
 */
export function parseGitLogDates(output: string): string[] {
  const dates: string[] = []
  for (const line of output.split(/\r?\n/)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(line)) dates.push(line)
  }
  return dates
}

/** Fold parsed commit dates into the aligned buckets (in place). */
export function foldCommitsInto(days: readonly DayUsage[], dates: readonly string[]): void {
  const index = indexBuckets(days)
  for (const date of dates) {
    const day = index.get(date)
    if (day !== undefined) day.commits += 1
  }
}

/**
 * Build the today summary directly from today's usage samples, keeping the
 * per-model token split accurate.
 * @param samples - usage samples whose dateKey equals today.
 * @param table - resolved price table.
 * @param now - anchor timestamp.
 */
export function buildTodayFromSamples(
  samples: readonly UsageSample[],
  table: Record<string, ModelPrice>,
  now: number = Date.now(),
): TodaySummary {
  const today = dateKey(now)
  const perModel = new Map<string, { tokens: number; usd: number; input: number; cacheRead: number; cacheWrite: number; output: number }>()
  let input = 0
  let output = 0
  let cacheRead = 0
  let cacheWrite = 0
  for (const sample of samples) {
    if (dateKey(sample.time) !== today) continue
    input += sample.inputTokens
    output += sample.outputTokens
    cacheRead += sample.cacheReadTokens
    cacheWrite += sample.cacheWriteTokens
    const row = perModel.get(sample.model) ?? { tokens: 0, usd: 0, input: 0, cacheRead: 0, cacheWrite: 0, output: 0 }
    row.tokens += billedTokens(sample)
    row.usd += costUsd(sample, table[sample.model] ?? priceFor(sample.model, undefined))
    row.input += sample.inputTokens
    row.cacheRead += sample.cacheReadTokens
    row.cacheWrite += sample.cacheWriteTokens
    row.output += sample.outputTokens
    perModel.set(sample.model, row)
  }
  const prompt = input + cacheRead + cacheWrite
  const models: TodayModelRow[] = [...perModel.entries()]
    .map(([model, row]) => ({ model, tokens: row.tokens, usd: row.usd }))
    .sort((a, b) => b.usd - a.usd)
  return {
    tokens: input + output + cacheRead + cacheWrite,
    inputTokens: input,
    outputTokens: output,
    cacheReadTokens: cacheRead,
    cacheWriteTokens: cacheWrite,
    cacheHitRate: prompt > 0 ? cacheRead / prompt : 0,
    costUsd: models.reduce((sum, row) => sum + row.usd, 0),
    models,
  }
}

/** Assemble the complete payload from folded buckets and today samples. */
export function assemblePayload(
  days: readonly DayUsage[],
  todaySamples: readonly UsageSample[],
  table: Record<string, ModelPrice>,
  now: number = Date.now(),
  cnyRate: number = 0,
): HeatmapPayload {
  return {
    days: days.map((day) => ({
      date: day.date,
      inputTokens: day.inputTokens,
      cacheReadTokens: day.cacheReadTokens,
      cacheWriteTokens: day.cacheWriteTokens,
      outputTokens: day.outputTokens,
      commits: day.commits,
      modelCostUsd: day.modelCostUsd,
    })),
    today: buildTodayFromSamples(todaySamples, table, now),
    generatedAt: now,
    dayCount: days.length,
    cnyRate,
  }
}