/**
 * Host loader entry for the dsh-activity-heatmap plugin.
 *
 * The host half owns the data: it scans the durable session logs (provider
 * token usage via `sessionPersistence`) and the workspace git repositories
 * (daily commits via the `subprocess` seam), folds them into a TTL-cached
 * snapshot, and serves it to the browser half at GET /activity-heatmap/stats.
 * Configuration comes from the composition entry only (no settings-page
 * section), and the plugin announces itself to every agent through the
 * system-prompt band.
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { HeatmapConfig } from './core/types.ts';
/** Model-facing announcement: plugin presence, capabilities, and limits. */
export declare const ACTIVITY_HEATMAP_GUIDANCE = "\u672C\u673A\u5DF2\u5B89\u88C5 dsh-activity-heatmap \u63D2\u4EF6\uFF08DSH Web GUI \u7684\u5DE6\u4FA7\u680F\u6D3B\u52A8\u70ED\u529B\u56FE\uFF09\uFF1A\u5E38\u9A7B\u9762\u677F\u6309\u65E5\u663E\u793A\u8FD1 90 \u5929\u6D3B\u52A8\uFF08\u53EF\u5207\u6362\u63D0\u4EA4\u6B21\u6570 / Token \u7528\u91CF / \u4F30\u7B97\u82B1\u8D39\uFF09\uFF0C\u9762\u677F\u4E0B\u65B9\u7EDF\u8BA1\u5757\u663E\u793A\u4ECA\u65E5\u6240\u6709\u4F1A\u8BDD\u7684 Token \u603B\u91CF\u3001\u7F13\u5B58\u547D\u4E2D\u7387\u3001\u6309\u6A21\u578B\u81EA\u52A8\u8BA1\u7B97\u7684\u82B1\u8D39\uFF0C\u4EE5\u53CA\u8FD1 90 \u5929\u6C47\u603B\u3002\u6570\u636E\u6765\u81EA\u672C\u673A\u4F1A\u8BDD\u65E5\u5FD7\uFF08provider usage\uFF09\u4E0E\u5DE5\u4F5C\u533A git \u65E5\u5FD7\uFF0C\u5BBF\u4E3B\u8FDB\u7A0B\u7ECF /activity-heatmap/* \u8DEF\u7531\u63D0\u4F9B\u3002\u7528\u6237\u63D0\u5230\u300C\u70ED\u529B\u56FE / \u6D3B\u52A8\u7EDF\u8BA1 / Token \u7528\u91CF / \u7F13\u5B58\u547D\u4E2D\u7387 / \u82B1\u8D39\u300D\u65F6\u5373\u6307\u672C\u63D2\u4EF6\uFF0C\u8BF7\u636E\u6B64\u534F\u4F5C\u3002";
/** Plugin config schema (mirrors HeatmapConfig). */
export declare const Config: z<HeatmapConfig>;
export declare const inject: string[];
/**
 * Apply the host half.
 * @param ctx - context carrying sessionPersistence, webServer, subprocess, systemPrompt.
 * @param config - resolved plugin config (schema defaults applied by the loader).
 */
export declare function apply(ctx: Context, config?: HeatmapConfig): void;
