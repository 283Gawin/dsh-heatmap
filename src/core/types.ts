/**
 * Shared vocabulary between the host stats service and the browser heatmap
 * panel. Everything crossing the /activity-heatmap/* wire is declared here so
 * the two halves cannot drift.
 * @module dsh-activity-heatmap/core/types
 */

/** One calendar day's aggregated activity. */
export interface DayUsage {
  date: string
  inputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
  commits: number
  modelCostUsd: Record<string, number>
}

/** One model's contribution to the current day. */
export interface TodayModelRow {
  model: string
  tokens: number
  usd: number
}

/** The "today" summary line under the heatmap. */
export interface TodaySummary {
  tokens: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  cacheHitRate: number
  costUsd: number
  models: TodayModelRow[]
}

/** Full payload the panel renders. */
export interface HeatmapPayload {
  days: DayUsage[]
  today: TodaySummary
  generatedAt: number
  dayCount: number
  cnyRate: number
}

/** The heatmap metric a user can switch between. */
export type HeatmapMetric = 'commits' | 'tokens' | 'cost'

/** Aggregation view mode matching Codex's Token Activity panel. */
export type HeatmapView = 'daily' | 'weekly' | 'cumulative'

/** Color theme: blue (Codex default) or green (GitHub default). */
export type HeatmapTheme = 'blue' | 'green'

/** Days the heatmap covers. ~13 weeks, fits the sidebar width. */
export const HEATMAP_DAYS = 91

/** HTTP envelope shared by the route layer. */
export type StatsEnvelope<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } }

/** Live plugin configuration the host applies. */
export interface HeatmapConfig {
  theme?: HeatmapTheme
  enabled?: boolean
  includeMerges?: boolean
  extraRepos?: string[]
  usdCnyRate?: number
  priceOverrides?: Record<string, {
    inputPerM?: number
    cacheReadPerM?: number
    cacheWritePerM?: number
    outputPerM?: number
  }>
}