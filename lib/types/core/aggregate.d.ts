/**
 * Pure aggregation folds for the heatmap: session-event usage extraction,
 * per-day bucketing, git log date parsing, and the today summary. All
 * functions are side-effect free so the folds are unit-testable without a
 * session backend.
 * @module dsh-activity-heatmap/core/aggregate
 */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { type ModelPrice } from './pricing.ts';
import type { DayUsage, HeatmapPayload, TodaySummary } from './types.ts';
/** One provider-reported usage sample with its model attribution. */
export interface UsageSample {
    /** Unix epoch ms of the carrying event. */
    time: number;
    inputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    outputTokens: number;
    /** Model id tracked from the nearest request/header or request/context. */
    model: string;
}
/** Local calendar-day key for an epoch-ms timestamp ('YYYY-MM-DD'). */
export declare function dateKey(time: number): string;
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
export declare function foldSessionUsages(events: readonly SessionEvent[]): UsageSample[];
/** Merge one usage sample into a day bucket. */
export declare function mergeSample(day: DayUsage, sample: UsageSample, price: ModelPrice): void;
/** Billed token total for one day (all four components). */
export declare function billedFor(day: DayUsage): number;
/**
 * Build a 365-day (or custom-length) bucket array aligned to the local
 * calendar, oldest first, ending today. Buckets are fresh zeroed rows; the
 * caller folds samples and commits into them.
 * @param dayCount - number of days to cover (default 365).
 * @param now - anchor timestamp (defaults to Date.now()).
 */
export declare function emptyBuckets(dayCount: number, now?: number): DayUsage[];
/** Index a bucket array by its date key. */
export declare function indexBuckets(days: readonly DayUsage[]): Map<string, DayUsage>;
/** Fold all usage samples into the aligned buckets (in place). */
export declare function foldSamplesInto(days: readonly DayUsage[], samples: readonly UsageSample[], table: Record<string, ModelPrice>): void;
/**
 * Parse `git log --date=short --pretty=format:%ad` output into date keys.
 * Non-date lines (warnings, empty lines) are ignored.
 */
export declare function parseGitLogDates(output: string): string[];
/** Fold parsed commit dates into the aligned buckets (in place). */
export declare function foldCommitsInto(days: readonly DayUsage[], dates: readonly string[]): void;
/**
 * Build the today summary directly from today's usage samples, keeping the
 * per-model token split accurate.
 * @param samples - usage samples whose dateKey equals today.
 * @param table - resolved price table.
 * @param now - anchor timestamp.
 */
export declare function buildTodayFromSamples(samples: readonly UsageSample[], table: Record<string, ModelPrice>, now?: number): TodaySummary;
/** Assemble the complete payload from folded buckets and today samples. */
export declare function assemblePayload(days: readonly DayUsage[], todaySamples: readonly UsageSample[], table: Record<string, ModelPrice>, now?: number, cnyRate?: number): HeatmapPayload;
