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
  inputPerM: number
  /** Cache-read (hit) input tokens. */
  cacheReadPerM: number
  /** Cache-write input tokens (DeepSeek: 0; Anthropic bills these). */
  cacheWritePerM: number
  /** Completion tokens. */
  outputPerM: number
}

/** Fallback price applied to models absent from the table. */
const DEFAULT_PRICE: ModelPrice = { inputPerM: 0.27, cacheReadPerM: 0.07, cacheWritePerM: 0, outputPerM: 1.1 }

/** Built-in price rows for the models DSH commonly routes to.
 * Rates follow the xiufengsun/TokenTracker curated price overrides
 * (verified against vendor pages 2026-06/07) plus vendor list pages.
 * Units: USD per 1M tokens. */
export const DEFAULT_MODEL_PRICES: Record<string, ModelPrice> = {
  // ---- DeepSeek (official api-docs.deepseek.com, verified 2026-06-10) ----
  // V4 series: current flat pricing (before the 2026-08-16 peak/off-peak switch).
  'deepseek-v4-flash': { inputPerM: 0.14, cacheReadPerM: 0.0028, cacheWritePerM: 0.14, outputPerM: 0.28 },
  'deepseek-v4-pro': { inputPerM: 0.435, cacheReadPerM: 0.003625, cacheWritePerM: 0.435, outputPerM: 0.87 },
  'deepseek-chat': { inputPerM: 0.14, cacheReadPerM: 0.0028, cacheWritePerM: 0.14, outputPerM: 0.28 },
  'deepseek-v3': { inputPerM: 0.27, cacheReadPerM: 0.07, cacheWritePerM: 0, outputPerM: 1.1 },
  'deepseek-v3.1': { inputPerM: 0.56, cacheReadPerM: 0.056, cacheWritePerM: 0, outputPerM: 1.68 },
  'deepseek-v3.2': { inputPerM: 0.28, cacheReadPerM: 0.028, cacheWritePerM: 0, outputPerM: 0.42 },
  'deepseek-v3.2-expensive': { inputPerM: 0.56, cacheReadPerM: 0.056, cacheWritePerM: 0, outputPerM: 1.68 },
  'deepseek-reasoner': { inputPerM: 0.14, cacheReadPerM: 0.0028, cacheWritePerM: 0.14, outputPerM: 0.28 },
  'deepseek-r1': { inputPerM: 0.55, cacheReadPerM: 0.14, cacheWritePerM: 0, outputPerM: 2.19 },

  // ---- Anthropic Claude (cache-write is billed) ----
  'claude-3-haiku': { inputPerM: 0.25, cacheReadPerM: 0.025, cacheWritePerM: 0.3, outputPerM: 1.25 },
  'claude-3-5-haiku': { inputPerM: 0.8, cacheReadPerM: 0.08, cacheWritePerM: 1, outputPerM: 4 },
  'claude-3-5-sonnet': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 3.75, outputPerM: 15 },
  'claude-3-7-sonnet': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 3.75, outputPerM: 15 },
  'claude-3-opus': { inputPerM: 15, cacheReadPerM: 1.5, cacheWritePerM: 18.75, outputPerM: 75 },
  'claude-sonnet-4': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 3.75, outputPerM: 15 },
  'claude-sonnet-4-5': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 3.75, outputPerM: 15 },
  'claude-opus-4': { inputPerM: 15, cacheReadPerM: 1.5, cacheWritePerM: 18.75, outputPerM: 75 },
  'claude-opus-4-1': { inputPerM: 15, cacheReadPerM: 1.5, cacheWritePerM: 18.75, outputPerM: 75 },
  'claude-opus-4-8': { inputPerM: 5, cacheReadPerM: 0.5, cacheWritePerM: 6.25, outputPerM: 25 },
  'claude-opus-5': { inputPerM: 5, cacheReadPerM: 0.5, cacheWritePerM: 6.25, outputPerM: 25 },
  'claude-opus-5-fast': { inputPerM: 10, cacheReadPerM: 1, cacheWritePerM: 12.5, outputPerM: 50 },
  'claude-sonnet-5': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 3.75, outputPerM: 15 },
  'claude-fable-5': { inputPerM: 10, cacheReadPerM: 1, cacheWritePerM: 12.5, outputPerM: 50 },
  'claude-haiku-4-5': { inputPerM: 1, cacheReadPerM: 0.1, cacheWritePerM: 1.25, outputPerM: 5 },

  // ---- OpenAI (developers.openai.com/api/docs/pricing) ----
  'gpt-4o': { inputPerM: 2.5, cacheReadPerM: 1.25, cacheWritePerM: 0, outputPerM: 10 },
  'gpt-4o-mini': { inputPerM: 0.15, cacheReadPerM: 0.075, cacheWritePerM: 0, outputPerM: 0.6 },
  'gpt-4.1': { inputPerM: 2, cacheReadPerM: 0.5, cacheWritePerM: 0, outputPerM: 8 },
  'gpt-4.1-mini': { inputPerM: 0.4, cacheReadPerM: 0.1, cacheWritePerM: 0, outputPerM: 1.6 },
  'gpt-4.1-nano': { inputPerM: 0.1, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 0.4 },
  'gpt-4.5': { inputPerM: 75, cacheReadPerM: 37.5, cacheWritePerM: 0, outputPerM: 150 },
  'o3': { inputPerM: 2, cacheReadPerM: 0.5, cacheWritePerM: 0, outputPerM: 8 },
  'o3-mini': { inputPerM: 1.1, cacheReadPerM: 0.275, cacheWritePerM: 0, outputPerM: 4.4 },
  'o4-mini': { inputPerM: 1.1, cacheReadPerM: 0.275, cacheWritePerM: 0, outputPerM: 4.4 },
  'gpt-5': { inputPerM: 1.25, cacheReadPerM: 0.125, cacheWritePerM: 0, outputPerM: 10 },
  'gpt-5-mini': { inputPerM: 0.25, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 2 },
  'gpt-5-nano': { inputPerM: 0.05, cacheReadPerM: 0.005, cacheWritePerM: 0, outputPerM: 0.4 },
  'gpt-5.1': { inputPerM: 1.25, cacheReadPerM: 0.125, cacheWritePerM: 0, outputPerM: 10 },
  'gpt-5.1-mini': { inputPerM: 0.25, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 2 },
  'gpt-5.1-nano': { inputPerM: 0.05, cacheReadPerM: 0.005, cacheWritePerM: 0, outputPerM: 0.4 },
  'gpt-5.6-sol': { inputPerM: 5, cacheReadPerM: 0.5, cacheWritePerM: 6.25, outputPerM: 30 },
  'gpt-5.6-terra': { inputPerM: 2, cacheReadPerM: 0.2, cacheWritePerM: 2.5, outputPerM: 12 },
  'gpt-5.6-luna': { inputPerM: 0.2, cacheReadPerM: 0.02, cacheWritePerM: 0.25, outputPerM: 1.2 },

  // ---- Google Gemini (ai.google.dev/pricing) ----
  'gemini-2.0-flash': { inputPerM: 0.1, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 0.4 },
  'gemini-2.0-flash-lite': { inputPerM: 0.075, cacheReadPerM: 0.01875, cacheWritePerM: 0, outputPerM: 0.3 },
  'gemini-2.5-flash': { inputPerM: 0.3, cacheReadPerM: 0.075, cacheWritePerM: 0, outputPerM: 2.5 },
  'gemini-2.5-flash-lite': { inputPerM: 0.1, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 0.4 },
  'gemini-2.5-pro': { inputPerM: 1.25, cacheReadPerM: 0.3125, cacheWritePerM: 0, outputPerM: 10 },
  'gemini-3-pro-preview': { inputPerM: 2, cacheReadPerM: 0.5, cacheWritePerM: 0, outputPerM: 12 },
  'gemini-3-flash-preview': { inputPerM: 0.3, cacheReadPerM: 0.075, cacheWritePerM: 0, outputPerM: 2.5 },
  'gemini-3-flash-lite-preview': { inputPerM: 0.1, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 0.4 },

  // ---- xAI Grok (docs.x.ai + Cursor pricing) ----
  'grok-3': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 0, outputPerM: 15 },
  'grok-3-mini': { inputPerM: 0.3, cacheReadPerM: 0.03, cacheWritePerM: 0, outputPerM: 0.5 },
  'grok-4': { inputPerM: 3, cacheReadPerM: 0.75, cacheWritePerM: 0, outputPerM: 15 },
  'grok-4-latest': { inputPerM: 3, cacheReadPerM: 0.75, cacheWritePerM: 0, outputPerM: 15 },
  'grok-4-0709': { inputPerM: 3, cacheReadPerM: 0.75, cacheWritePerM: 0, outputPerM: 15 },
  'grok-4-fast': { inputPerM: 0.2, cacheReadPerM: 0.05, cacheWritePerM: 0, outputPerM: 0.5 },
  'grok-4-fast-reasoning': { inputPerM: 0.2, cacheReadPerM: 0.05, cacheWritePerM: 0, outputPerM: 0.5 },
  'grok-4-fast-non-reasoning': { inputPerM: 0.2, cacheReadPerM: 0.05, cacheWritePerM: 0, outputPerM: 0.5 },
  'grok-4-1-fast-non-reasoning': { inputPerM: 0.2, cacheReadPerM: 0.05, cacheWritePerM: 0, outputPerM: 0.5 },
  'grok-4.5': { inputPerM: 2, cacheReadPerM: 0.5, cacheWritePerM: 0, outputPerM: 6 },
  'grok-4.5-fast': { inputPerM: 4, cacheReadPerM: 1, cacheWritePerM: 0, outputPerM: 18 },
  'grok-build': { inputPerM: 1.25, cacheReadPerM: 0.2, cacheWritePerM: 0, outputPerM: 2.5 },
  'grok-4.5-build': { inputPerM: 2, cacheReadPerM: 0.5, cacheWritePerM: 0, outputPerM: 6 },
  'grok-build-free': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'grok-4.5-build-free': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'grok-code-fast': { inputPerM: 0.2, cacheReadPerM: 0.05, cacheWritePerM: 0, outputPerM: 0.5 },
  'grok-code-reasoner': { inputPerM: 3, cacheReadPerM: 0.75, cacheWritePerM: 0, outputPerM: 15 },

  // ---- Kiro (Codex custom agent, Anthropic-style cache) ----
  'kiro-agent': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 3.75, outputPerM: 15 },
  'kiro-cli-agent': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 3.75, outputPerM: 15 },

  // ---- Alibaba Qwen ----
  'qwen3-max': { inputPerM: 1.28, cacheReadPerM: 0.16, cacheWritePerM: 0, outputPerM: 6.4 },
  'qwen3-coder': { inputPerM: 0.22, cacheReadPerM: 0.0275, cacheWritePerM: 0, outputPerM: 0.88 },
  'qwen3-235b-a22b': { inputPerM: 0.9, cacheReadPerM: 0.1125, cacheWritePerM: 0, outputPerM: 3.6 },
  'qwen3-32b': { inputPerM: 0.14, cacheReadPerM: 0.0175, cacheWritePerM: 0, outputPerM: 0.56 },

  // ---- Zhipu GLM (TokenTracker verified) ----
  'glm-4.5': { inputPerM: 0.6, cacheReadPerM: 0.11, cacheWritePerM: 0, outputPerM: 2.2 },
  'glm-4.5-air': { inputPerM: 0.2, cacheReadPerM: 0.03, cacheWritePerM: 0, outputPerM: 1.1 },
  'glm-4.5-airx': { inputPerM: 1.1, cacheReadPerM: 0.22, cacheWritePerM: 0, outputPerM: 4.5 },
  'glm-4.5-x': { inputPerM: 2.2, cacheReadPerM: 0.45, cacheWritePerM: 0, outputPerM: 8.9 },
  'glm-4.6': { inputPerM: 0.6, cacheReadPerM: 0.11, cacheWritePerM: 0, outputPerM: 2.2 },
  'glm-4.6-air': { inputPerM: 0.2, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 0.6 },
  'glm-4.7': { inputPerM: 0.6, cacheReadPerM: 0.11, cacheWritePerM: 0, outputPerM: 2.2 },
  'glm-4.7-flash': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'glm-4.7-flashx': { inputPerM: 0.07, cacheReadPerM: 0.01, cacheWritePerM: 0, outputPerM: 0.4 },
  'glm-4.7-free': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'glm-4.5-flash': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'glm-5': { inputPerM: 1, cacheReadPerM: 0.2, cacheWritePerM: 0, outputPerM: 3.2 },
  'glm-5-turbo': { inputPerM: 1.2, cacheReadPerM: 0.24, cacheWritePerM: 0, outputPerM: 4 },
  'glm-5.1': { inputPerM: 1.4, cacheReadPerM: 0.26, cacheWritePerM: 0, outputPerM: 4.4 },
  'glm-5.2': { inputPerM: 1.4, cacheReadPerM: 0.26, cacheWritePerM: 0, outputPerM: 4.4 },

  // ---- Moonshot Kimi (TokenTracker verified) ----
  'kimi-k2': { inputPerM: 0.6, cacheReadPerM: 0.15, cacheWritePerM: 0, outputPerM: 2 },
  'kimi-k2-thinking': { inputPerM: 0.6, cacheReadPerM: 0.15, cacheWritePerM: 0, outputPerM: 2 },
  'kimi-k2.5': { inputPerM: 0.6, cacheReadPerM: 0.15, cacheWritePerM: 0, outputPerM: 2 },
  'kimi-k2.5-free': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'kimi-k2.6': { inputPerM: 0.95, cacheReadPerM: 0.16, cacheWritePerM: 0, outputPerM: 4 },
  'kimi-k2.7-code': { inputPerM: 0.95, cacheReadPerM: 0.19, cacheWritePerM: 0, outputPerM: 4 },
  'kimi-k3': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 0, outputPerM: 15 },
  'k3': { inputPerM: 3, cacheReadPerM: 0.3, cacheWritePerM: 0, outputPerM: 15 },
  'kimi-for-coding': { inputPerM: 0.6, cacheReadPerM: 0.15, cacheWritePerM: 0, outputPerM: 2 },

  // ---- MiniMax (TokenTracker verified) ----
  'minimax-m1': { inputPerM: 0.2, cacheReadPerM: 0.025, cacheWritePerM: 0, outputPerM: 1.1 },
  'minimax-m2': { inputPerM: 0.3, cacheReadPerM: 0.0375, cacheWritePerM: 0, outputPerM: 1.2 },
  'minimax-m2.1': { inputPerM: 0.5, cacheReadPerM: 0.05, cacheWritePerM: 0, outputPerM: 3 },
  'minimax-m2.1-free': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'minimax-m2.7': { inputPerM: 0.3, cacheReadPerM: 0.06, cacheWritePerM: 0.375, outputPerM: 1.2 },
  'minimax-m2.7-highspeed': { inputPerM: 0.6, cacheReadPerM: 0.06, cacheWritePerM: 0.375, outputPerM: 2.4 },
  'minimax-m3': { inputPerM: 0.3, cacheReadPerM: 0.06, cacheWritePerM: 0, outputPerM: 1.2 },
  'mimo-v2-pro-free': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },
  'nemotron-3-super-free': { inputPerM: 0, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 0 },

  // ---- Tencent Hunyuan Hy3 (TokenHub rate, ~7.2 RMB/USD) ----
  'hy3': { inputPerM: 0.167, cacheReadPerM: 0.056, cacheWritePerM: 0.167, outputPerM: 0.556 },
  'hy3-preview': { inputPerM: 0.167, cacheReadPerM: 0.056, cacheWritePerM: 0.167, outputPerM: 0.556 },
  'hy3-preview-agent': { inputPerM: 0.167, cacheReadPerM: 0.056, cacheWritePerM: 0.167, outputPerM: 0.556 },

  // ---- Composer / Antigravity aliases ----
  'composer-1': { inputPerM: 1.25, cacheReadPerM: 0.125, cacheWritePerM: 0, outputPerM: 10 },
  'composer-1.5': { inputPerM: 3.5, cacheReadPerM: 0.35, cacheWritePerM: 0, outputPerM: 17.5 },
  'composer-2': { inputPerM: 0.5, cacheReadPerM: 0.2, cacheWritePerM: 0, outputPerM: 2.5 },
  'composer-2-fast': { inputPerM: 1.5, cacheReadPerM: 0.15, cacheWritePerM: 0, outputPerM: 7.5 },
  'antigravity-gpt-oss-120b': { inputPerM: 2.5, cacheReadPerM: 0, cacheWritePerM: 0, outputPerM: 10 },

  // ---- Others (TokenTracker verified) ----
  'sakana/fugu-ultra': { inputPerM: 5, cacheReadPerM: 0.5, cacheWritePerM: 5, outputPerM: 30 },
  'longcat-2.0': { inputPerM: 0.278, cacheReadPerM: 0.00556, cacheWritePerM: 0.278, outputPerM: 1.111 },
  'step-3.5-flash': { inputPerM: 0.1, cacheReadPerM: 0.02, cacheWritePerM: 0.1, outputPerM: 0.3 },
  'step-3.7-flash': { inputPerM: 0.2, cacheReadPerM: 0.04, cacheWritePerM: 0.2, outputPerM: 1.15 },
}

/** One billable usage observation, already attributed to a model. */
export interface PricedUsage {
  inputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

/**
 * Resolve a table row for a model id: exact match first, then the longest
 * built-in key that is a `-`-delimited prefix of the id (dated snapshots),
 * then the default row. Overrides win over built-ins at every stage.
 * @param model - the model id from a request header.
 * @param overrides - user price overrides (may be partial rows).
 * @param table - the built-in table to search.
 */
export function priceFor(
  model: string,
  overrides: Record<string, Partial<ModelPrice>> | undefined,
  table: Record<string, ModelPrice> = DEFAULT_MODEL_PRICES,
): ModelPrice {
  const resolved = resolveRow(model, overrides, table)
  return {
    inputPerM: resolved.inputPerM,
    cacheReadPerM: resolved.cacheReadPerM,
    cacheWritePerM: resolved.cacheWritePerM,
    outputPerM: resolved.outputPerM,
  }
}

/** Locate the effective (override-merged) row for a model id. */
function resolveRow(
  model: string,
  overrides: Record<string, Partial<ModelPrice>> | undefined,
  table: Record<string, ModelPrice>,
): ModelPrice {
  // Exact match: override first, then built-in.
  const exactOverride = overrides?.[model]
  if (exactOverride !== undefined) return mergeOverride(model, exactOverride, table)
  if (table[model] !== undefined) return table[model]

  // Longest prefix match against both tables (dated snapshot ids).
  const best = { key: '', len: -1, override: false }
  for (const key of Object.keys(overrides ?? {})) {
    if (key.length > best.len && isPrefix(key, model)) { best.key = key; best.len = key.length; best.override = true }
  }
  if (best.override) return mergeOverride(best.key, overrides![best.key], table)
  for (const key of Object.keys(table)) {
    if (key.length > best.len && isPrefix(key, model)) { best.key = key; best.len = key.length; best.override = false }
  }
  if (best.len >= 0) return table[best.key]
  return DEFAULT_PRICE
}

/** Whether `prefix` is a `-`-delimited prefix of `model`. */
function isPrefix(prefix: string, model: string): boolean {
  return model.length > prefix.length && model.startsWith(prefix) && model[prefix.length] === '-'
}

/** Merge a (possibly partial) override row over the built-in/default row. */
function mergeOverride(
  key: string,
  override: Partial<ModelPrice>,
  table: Record<string, ModelPrice>,
): ModelPrice {
  const base = table[key] ?? DEFAULT_PRICE
  return {
    inputPerM: override.inputPerM ?? base.inputPerM,
    cacheReadPerM: override.cacheReadPerM ?? base.cacheReadPerM,
    cacheWritePerM: override.cacheWritePerM ?? base.cacheWritePerM,
    outputPerM: override.outputPerM ?? base.outputPerM,
  }
}

/** Compute the USD cost of one usage observation under one price row. */
export function costUsd(usage: PricedUsage, price: ModelPrice): number {
  const perM = 1_000_000
  return (
    usage.inputTokens * price.inputPerM
    + usage.cacheReadTokens * price.cacheReadPerM
    + usage.cacheWriteTokens * price.cacheWritePerM
    + usage.outputTokens * price.outputPerM
  ) / perM
}

/** Billed token total for one observation (all four components). */
export function billedTokens(usage: PricedUsage): number {
  return usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens + usage.outputTokens
}

/**
 * Merge user price overrides into a complete table. Overrides may be partial
 * ({@link HeatmapConfig.priceOverrides} shape); missing fields fall through to
 * the built-in row or the default row. Unknown override keys are added as
 * full rows.
 */
export function resolvePriceTable(
  overrides: Record<string, { inputPerM?: number; cacheReadPerM?: number; cacheWritePerM?: number; outputPerM?: number }> | undefined,
): Record<string, ModelPrice> {
  const table: Record<string, ModelPrice> = {}
  const keys = new Set([...Object.keys(DEFAULT_MODEL_PRICES), ...Object.keys(overrides ?? {})])
  for (const model of keys) {
    table[model] = resolveRow(model, overrides, DEFAULT_MODEL_PRICES)
  }
  return table
}
