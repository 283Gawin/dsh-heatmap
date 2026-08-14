/**
 * Model pricing table and spend estimation.
 *
 * Built-in rows follow each vendor's published API pricing (USD per 1M
 * tokens, as of 2025-2026 public price sheets). Providers bill cache-read
 * input at a discount and cache-write input either at a small fee (Anthropic)
 * or not at all (DeepSeek / OpenAI / Google / xAI / Chinese vendors).
 * Unknown models fall back to the default row so a novel model id never
 * crashes the estimate; users can override any row through the settings
 * namespace (`priceOverrides`).
 *
 * Model ids are matched exactly first, then by the longest built-in key that
 * is a `-`-delimited prefix of the id, so dated snapshot ids like
 * `claude-sonnet-4-5-20250929` or `gpt-5.1-20250807` still resolve to the
 * base row.
 * @module dsh-activity-heatmap/core/pricing
 */
/** One model's price row, USD per 1M tokens. */
export interface ModelPrice {
    /** Cache-miss input tokens. */
    inputPerM: number;
    /** Cache-read (hit) input tokens. */
    cacheReadPerM: number;
    /** Cache-write input tokens (DeepSeek: 0; Anthropic bills these). */
    cacheWritePerM: number;
    /** Completion tokens. */
    outputPerM: number;
}
/** Built-in price rows for the models DSH commonly routes to.
 * Rates follow the xiufengsun/TokenTracker curated price overrides
 * (verified against vendor pages 2026-06/07) plus vendor list pages.
 * Units: USD per 1M tokens. */
export declare const DEFAULT_MODEL_PRICES: Record<string, ModelPrice>;
/** One billable usage observation, already attributed to a model. */
export interface PricedUsage {
    inputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    outputTokens: number;
}
/**
 * Resolve a table row for a model id: exact match first, then the longest
 * built-in key that is a `-`-delimited prefix of the id (dated snapshots),
 * then the default row. Overrides win over built-ins at every stage.
 * @param model - the model id from a request header.
 * @param overrides - user price overrides (may be partial rows).
 * @param table - the built-in table to search.
 */
export declare function priceFor(model: string, overrides: Record<string, Partial<ModelPrice>> | undefined, table?: Record<string, ModelPrice>): ModelPrice;
/** Compute the USD cost of one usage observation under one price row. */
export declare function costUsd(usage: PricedUsage, price: ModelPrice): number;
/** Billed token total for one observation (all four components). */
export declare function billedTokens(usage: PricedUsage): number;
/**
 * Merge user price overrides into a complete table. Overrides may be partial
 * ({@link HeatmapConfig.priceOverrides} shape); missing fields fall through to
 * the built-in row or the default row. Unknown override keys are added as
 * full rows.
 */
export declare function resolvePriceTable(overrides: Record<string, {
    inputPerM?: number;
    cacheReadPerM?: number;
    cacheWritePerM?: number;
    outputPerM?: number;
}> | undefined): Record<string, ModelPrice>;
