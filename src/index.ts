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

import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { HeatmapConfig } from './core/types.ts'
import { registerStatsRoutes } from './host/routes.ts'
import { StatsService } from './host/stats-service.ts'

/** Order of the announcement section within the tool-guidance band. */
const SECTION_ORDER = 215

/** Model-facing announcement: plugin presence, capabilities, and limits. */
export const ACTIVITY_HEATMAP_GUIDANCE = '本机已安装 dsh-activity-heatmap 插件（DSH Web GUI 的左侧栏活动热力图）：常驻面板按日显示近 90 天活动（可切换提交次数 / Token 用量 / 估算花费），面板下方统计块显示今日所有会话的 Token 总量、缓存命中率、按模型自动计算的花费，以及近 90 天汇总。数据来自本机会话日志（provider usage）与工作区 git 日志，宿主进程经 /activity-heatmap/* 路由提供。用户提到「热力图 / 活动统计 / Token 用量 / 缓存命中率 / 花费」时即指本插件，请据此协作。'


const HEATMAP_NS = settingsNamespace('activity-heatmap')

/** Plugin config schema (mirrors HeatmapConfig). */
export const Config: z<HeatmapConfig> = z.object({
  enabled: z.boolean().default(true),
  includeMerges: z.boolean().default(false),
  extraRepos: z.array(z.string()).default([]),
  usdCnyRate: z.number().default(0),
  priceOverrides: z.dict(z.any()).default({}),
})

export const inject = ['sessionPersistence', 'webServer', 'subprocess', 'systemPrompt']

/**
 * Apply the host half.
 * @param ctx - context carrying sessionPersistence, webServer, subprocess, systemPrompt.
 * @param config - resolved plugin config (schema defaults applied by the loader).
 */
export function apply(ctx: Context, config?: HeatmapConfig): void {
  let current: () => HeatmapConfig = () => config ?? {}
  const stats = new StatsService(ctx, current)
  const disposeRoutes = registerStatsRoutes(ctx, stats)
  let disposeSection: (() => void) | undefined

  const sync = (): void => {
    if (disposeSection !== undefined) { disposeSection(); disposeSection = undefined }
    if ((current().enabled ?? true) === false) return
    disposeSection = ctx.systemPrompt.section({
      name: 'plugin:activity-heatmap',
      order: SECTION_ORDER,
      text: ACTIVITY_HEATMAP_GUIDANCE,
    })
    stats.invalidate()
  }

  installSettingsSection(ctx, HEATMAP_NS, Config, config ?? {}, {
    setSource: (source) => { current = source },
    onChange: sync,
  })
  sync()
}