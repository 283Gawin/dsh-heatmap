/**
 * The sidebar heatmap panel — Codex Token Activity style.
 *
 * Renders a ~91-day GitHub-style grid that can switch between commit counts,
 * billed token totals, and estimated USD spend, plus a stats block with
 * today's totals, cache hit rate, per-model cost breakdown, and the trailing
 * window sums. All data comes from GET /activity-heatmap/stats served by the
 * host half; the panel polls every POLL_MS and on visibility change.
 *
 * The panel is plain DOM (no React tree) so it can never disturb the shell's
 * reconciliation; it is mounted by sidebar.ts into the sidebar column.
 *
 * @module dsh-activity-heatmap/client/heatmap
 */
import { type HeatmapTheme } from '../core/types.ts';
/** Stable selector identifying the mounted panel (self-heal + tests). */
export declare const PANEL_SELECTOR = "[data-dsh-heatmap-panel]";
/** Bumped on every client rewrite so a stale cached bundle is easy to spot. */
export declare const PANEL_VERSION = "2";
/** The sidebar heatmap panel. Owns its DOM, poll timer, and render state. */
export declare class HeatmapPanel {
    readonly element: HTMLElement;
    private readonly metricBtns;
    private readonly viewBtns;
    private readonly toolbar;
    private readonly gridEl;
    private readonly labelsEl;
    private readonly todayEl;
    private readonly windowEl;
    private readonly modelEl;
    private readonly statsBlock;
    private readonly statusEl;
    private metric;
    private view;
    private theme;
    private collapsed;
    private payload;
    private timer;
    private disposed;
    constructor(initialTheme?: HeatmapTheme);
    /** Begin polling and attach the visibility listener. */
    start(): void;
    dispose(): void;
    private readonly onVis;
    private setMetric;
    private setView;
    setTheme(t: HeatmapTheme): void;
    private applyButtons;
    private applyCollapsed;
    private refresh;
    private render;
    private renderLabels;
}
