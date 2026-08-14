/**
 * Unit tests for the pure aggregation folds and pricing math.
 */
import { describe, expect, it } from 'vitest'
import {
  buildTodayFromSamples,
  dateKey,
  emptyBuckets,
  foldCommitsInto,
  foldSessionUsages,
  foldSamplesInto,
  parseGitLogDates,
  type UsageSample,
} from '../src/core/aggregate.ts'
import { costUsd, priceFor, resolvePriceTable } from '../src/core/pricing.ts'

/** Build a minimal assistant/message event carrying usage. */
function usageEvent(seq: number, time: number, turn: number, step: number, usage: object) {
  return {
    type: 'assistant/message',
    seq,
    time,
    data: { turn, step, message: { role: 'assistant', content: [] }, usage },
  }
}

function headerEvent(seq: number, time: number, model: string) {
  return {
    type: 'request/header',
    seq,
    time,
    data: { header: { config: { provider: 'deepseek', model } }, reason: 'initial' },
  }
}

describe('dateKey', () => {
  it('formats a local date', () => {
    const d = new Date(2025, 0, 15, 12, 0, 0)
    expect(dateKey(d.getTime())).toBe('2025-01-15')
  })
})

describe('foldSessionUsages', () => {
  it('extracts usage with model attribution from the nearest header', () => {
    const events = [
      headerEvent(1, 1000, 'deepseek-chat'),
      usageEvent(2, 2000, 1, 1, { inputTokens: 100, outputTokens: 50 }),
      usageEvent(3, 3000, 1, 2, { inputTokens: 10, outputTokens: 5, cacheReadTokens: 3 }),
    ]
    const samples = foldSessionUsages(events as never)
    expect(samples).toHaveLength(2)
    expect(samples[0]).toMatchObject({ model: 'deepseek-chat', inputTokens: 100, outputTokens: 50 })
    expect(samples[1]).toMatchObject({ model: 'deepseek-chat', cacheReadTokens: 3 })
  })

  it('replaces a repeated usage for the same turn/step (retry)', () => {
    const events = [
      headerEvent(1, 1000, 'deepseek-chat'),
      usageEvent(2, 2000, 1, 1, { inputTokens: 100, outputTokens: 50 }),
      usageEvent(3, 2500, 1, 1, { inputTokens: 90, outputTokens: 60 }),
    ]
    const samples = foldSessionUsages(events as never)
    expect(samples).toHaveLength(1)
    expect(samples[0]).toMatchObject({ inputTokens: 90, outputTokens: 60, time: 2500 })
  })

  it('tracks model switches via request/context', () => {
    const events = [
      headerEvent(1, 1000, 'deepseek-chat'),
      usageEvent(2, 2000, 1, 1, { inputTokens: 100, outputTokens: 50 }),
      { type: 'request/context', seq: 3, time: 3000, data: { provider: 'deepseek', model: 'deepseek-reasoner' } },
      usageEvent(4, 4000, 2, 1, { inputTokens: 200, outputTokens: 10 }),
    ]
    const samples = foldSessionUsages(events as never)
    expect(samples[1].model).toBe('deepseek-reasoner')
  })
})

describe('buckets', () => {
  it('aligns buckets to local days ending today', () => {
    const now = new Date(2025, 5, 15, 10, 0, 0).getTime() // 2025-06-15
    const days = emptyBuckets(7, now)
    expect(days).toHaveLength(7)
    expect(days[0].date).toBe('2025-06-09')
    expect(days[6].date).toBe('2025-06-15')
  })

  it('folds samples and commits into the right buckets', () => {
    const now = new Date(2025, 5, 15, 10, 0, 0).getTime()
    const days = emptyBuckets(7, now)
    const sample: UsageSample = {
      time: new Date(2025, 5, 12, 8, 0, 0).getTime(),
      inputTokens: 100,
      cacheReadTokens: 20,
      cacheWriteTokens: 0,
      outputTokens: 50,
      model: 'deepseek-chat',
    }
    foldSamplesInto(days, [sample], resolvePriceTable(undefined))
    foldCommitsInto(days, ['2025-06-12', '2025-06-12', '2025-06-13'])
    expect(days[3].date).toBe('2025-06-12')
    expect(days[3].inputTokens).toBe(100)
    expect(days[3].cacheReadTokens).toBe(20)
    expect(days[3].commits).toBe(2)
    expect(days[4].commits).toBe(1)
    // Older than the window is dropped.
    const old: UsageSample = { time: new Date(2025, 4, 1).getTime(), inputTokens: 1, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 1, model: 'deepseek-chat' }
    foldSamplesInto(days, [old], resolvePriceTable(undefined))
    expect(days[0].inputTokens + days[1].inputTokens + days[2].inputTokens + days[3].inputTokens).toBe(100)
  })
})

describe('pricing', () => {
  it('computes DeepSeek chat cost with cache discount', () => {
    // deepseek-chat is billed at the current V4 rates (input 0.14, cache 0.0028, output 0.28).
    const price = priceFor('deepseek-chat', undefined)
    const usd = costUsd({ inputTokens: 1_000_000, cacheReadTokens: 1_000_000, cacheWriteTokens: 0, outputTokens: 1_000_000 }, price)
    expect(usd).toBeCloseTo(0.14 + 0.0028 + 0.28, 6)
  })

  it('honors overrides', () => {
    const table = resolvePriceTable({ 'my-model': { inputPerM: 1, outputPerM: 2 } })
    expect(table['my-model'].inputPerM).toBe(1)
    expect(table['my-model'].cacheReadPerM).toBe(0.07) // falls through
    expect(table['deepseek-chat'].inputPerM).toBe(0.14)
  })

  it('falls back to the default row for unknown models', () => {
    const price = priceFor('deepseek-v4-flash', undefined)
    expect(price.inputPerM).toBe(0.14) // built-in row, not the fallback
    expect(priceFor('brand-new-model-9000', undefined).inputPerM).toBe(0.27)
  })

  it('knows major vendor models', () => {
    const sonnet = priceFor('claude-sonnet-4-5', undefined)
    expect(sonnet.inputPerM).toBe(3)
    expect(sonnet.cacheWritePerM).toBe(3.75) // Anthropic bills cache writes
    expect(priceFor('gpt-4o', undefined).inputPerM).toBe(2.5)
    expect(priceFor('gemini-2.5-pro', undefined).outputPerM).toBe(10)
    expect(priceFor('kimi-k2', undefined).inputPerM).toBe(0.6)
    expect(priceFor('qwen3-coder', undefined).outputPerM).toBe(0.88)
    expect(priceFor('grok-4', undefined).inputPerM).toBe(3)
    expect(priceFor('glm-4.6', undefined).inputPerM).toBe(0.6)
    expect(priceFor('minimax-m2', undefined).inputPerM).toBe(0.3)
  })

  it('resolves dated snapshot ids by longest prefix', () => {
    const snap = priceFor('claude-sonnet-4-5-20250929', undefined)
    expect(snap.inputPerM).toBe(3)
    // deepseek-v3 is a prefix of deepseek-v3.2, but the longest match wins.
    const v32 = priceFor('deepseek-v3.2-20250928', undefined)
    expect(v32.inputPerM).toBe(0.28)
    // An exact unknown id still falls through to the default row.
    expect(priceFor('claude-9-3000', undefined).inputPerM).toBe(0.27)
  })

  it('prefix-matches overrides too', () => {
    const overrides = { 'deepseek-v4-flash': { inputPerM: 0.5, outputPerM: 2 } }
    const viaPrefix = priceFor('deepseek-v4-flash-20260801', overrides)
    expect(viaPrefix.inputPerM).toBe(0.5)
    expect(viaPrefix.cacheReadPerM).toBe(0.0028) // falls through to the built-in row
    expect(viaPrefix.outputPerM).toBe(2)
  })
})

describe('buildTodayFromSamples', () => {
  it('aggregates today only and computes the cache hit rate', () => {
    const now = new Date(2025, 5, 15, 12, 0, 0).getTime()
    const today = new Date(2025, 5, 15, 9, 0, 0).getTime()
    const yesterday = new Date(2025, 5, 14, 9, 0, 0).getTime()
    const samples: UsageSample[] = [
      { time: today, inputTokens: 80, cacheReadTokens: 20, cacheWriteTokens: 0, outputTokens: 40, model: 'deepseek-chat' },
      { time: today, inputTokens: 0, cacheReadTokens: 100, cacheWriteTokens: 0, outputTokens: 10, model: 'deepseek-reasoner' },
      { time: yesterday, inputTokens: 999, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 1, model: 'deepseek-chat' },
    ]
    const summary = buildTodayFromSamples(samples, resolvePriceTable(undefined), now)
    expect(summary.tokens).toBe(20 + 80 + 40 + 100 + 10)
    expect(summary.cacheHitRate).toBeCloseTo(120 / 200, 6)
    expect(summary.models).toHaveLength(2)
    expect(summary.models[0].model).toBe('deepseek-chat') // more billed tokens
    expect(summary.costUsd).toBeGreaterThan(0)
  })
})

describe('parseGitLogDates', () => {
  it('parses short date lines and ignores noise', () => {
    const out = '2025-06-01\n2025-06-02\nwarning: line too long\n2025-06-04'
    expect(parseGitLogDates(out)).toEqual(['2025-06-01', '2025-06-02', '2025-06-04'])
  })
})