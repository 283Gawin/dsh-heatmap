/**
 * /activity-heatmap/* HTTP layer: one GET stats endpoint served on the shared
 * webserver (same-origin with the GUI). The route layer owns HTTP shape only;
 * the StatsService owns scanning and caching.
 * @module dsh-activity-heatmap/host/routes
 */
import type { Context } from '@deepseek-ai/cordis';
import type { StatsService } from './stats-service.ts';
/**
 * Register the stats route (GET /activity-heatmap/stats).
 * @param ctx - context carrying the webServer service.
 * @param stats - the stats service backing the endpoint.
 * @returns route disposers.
 */
export declare function registerStatsRoutes(ctx: Context, stats: StatsService): () => void;
