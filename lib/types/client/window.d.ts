/**
 * Pure date-window helpers for the heatmap grid. Kept free of DOM/CSS so
 * they are unit-testable without a browser environment.
 * @module dsh-activity-heatmap/client/window
 */
import type { HeatmapRange } from '../core/types.ts';
/** Parse a 'YYYY-MM-DD' key into a local Date at midnight. */
export declare function parseDate(key: string): Date;
/** Local date key for a Date. */
export declare function keyOf(date: Date): string;
/**
 * The window's first day, as a date key (inclusive).
 * Trailing windows start `days - 1` days before today; a month window starts
 * on the 1st of that month.
 */
export declare function windowStart(range: HeatmapRange, now: Date): string;
/**
 * The window's last day (inclusive). Trailing windows end today; a month
 * window ends on the month's last day — except the current month, which ends
 * today when today has not reached the month end yet.
 */
export declare function windowEnd(range: HeatmapRange, now: Date): string;
/** The 12 calendar months ending with the current one, newest first. */
export declare function recentMonths(now: Date): {
    year: number;
    month: number;
}[];
/** Human label for a month window, e.g. 2026年8月. */
export declare function monthLabel(range: Extract<HeatmapRange, {
    kind: 'month';
}>): string;
