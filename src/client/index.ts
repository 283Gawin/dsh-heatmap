/**
 * dsh-activity-heatmap — browser half entry.
 *
 * Registers the plugin's settings card into the plugin-configuration section
 * (`settings.plugin.item`) and mounts the sidebar heatmap panel. The panel is
 * plain DOM managed by HeatmapPanel + mountSidebarPanel; the settings card is
 * a React component bound to the `activity-heatmap` settings namespace.
 *
 * @module dsh-activity-heatmap/client/index
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { HeatmapPanel } from './heatmap.ts'
import { mountSidebarPanel } from './sidebar.ts'
import { HeatmapSettingsCard, HeatmapSettingsCardController, type HeatmapSettings } from './HeatmapSettingsCard.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'settings.plugin.item': { kind: 'list'; scope: 'root'; owner: SettingsPluginItemOwnerProps }
  }
}
export interface SettingsPluginItemOwnerProps { children?: never }

const HEATMAP_NS = 'activity-heatmap'
export const inject = ['slots', 'settingsScope']

export function apply(ctx: Context): void {
  const scope = ctx.settingsScope.bind<HeatmapSettings>({ namespace: HEATMAP_NS })
  const ctrl = new HeatmapSettingsCardController(scope)

  // Settings card: one card in the plugin configuration section.
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'activity-heatmap',
    order: 120,
    inject: () => ctrl.inject(),
  }, HeatmapSettingsCard))

  // Sidebar panel: theme follows the settings namespace, mounts with
  // self-healing DOM injection.
  ctx.effect(() => {
    const snap = scope.getSnapshot()
    const initTheme = ((snap.status === 'ready' && snap.value?.theme) || 'blue') as 'blue' | 'green'
    const panel = new HeatmapPanel(initTheme)
    let disposer: (() => void) | undefined
    try {
      disposer = mountSidebarPanel(panel)
      panel.start()
      const unsub = scope.subscribe(() => {
        const s = scope.getSnapshot()
        panel.setTheme(((s.status === 'ready' && s.value?.theme) || 'blue') as 'blue' | 'green')
      })
      return () => { unsub(); disposer?.(); panel.dispose() }
    } catch (error) {
      ctx.logger.warn('[dsh-activity-heatmap] ' + String(error))
      panel.dispose()
      return () => { disposer?.() }
    }
  }, 'activity-heatmap: sidebar panel')
}
