import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import { PluginSettingsCard } from './PluginSettingsCard.tsx'
import { CardForm, booleanField, numberField, stringField, type CardActions, type CardShell, type FieldState } from './settings-form.ts'

export interface HeatmapSettings { theme?: string; enabled?: boolean; includeMerges?: boolean; usdCnyRate?: number }
export interface HeatmapSettingsCardState extends CardShell { theme: FieldState; enabled: FieldState; includeMerges: FieldState; usdCnyRate: FieldState }
export interface HeatmapSettingsCardFace extends CardActions { hooks: { heatmapSettingsCard: SnapshotStore<HeatmapSettingsCardState> } }

export class HeatmapSettingsCardController {
  private readonly form: CardForm<HeatmapSettings>; private readonly store: SnapshotStore<HeatmapSettingsCardState>
  constructor(scope: SettingsScope<HeatmapSettings>) {
    this.form = new CardForm(scope, [stringField('theme', v => v === 'blue' || v === 'green'), booleanField('enabled'), booleanField('includeMerges'), numberField('usdCnyRate')])
    this.store = this.form.bind(() => ({ ...this.form.shell(), theme: this.form.field('theme'), enabled: this.form.field('enabled'), includeMerges: this.form.field('includeMerges'), usdCnyRate: this.form.field('usdCnyRate') }))
  }
  inject(): HeatmapSettingsCardFace { return { hooks: { heatmapSettingsCard: this.store }, ...this.form.actions() } }
}

export type HeatmapSettingsCardProps = PropsRuntime<'settings.plugin.item'> & InjectFace<HeatmapSettingsCardFace>

export function HeatmapSettingsCard(props: HeatmapSettingsCardProps) {
  const state = props.useHeatmapSettingsCard(s => s); const d = !state.writable
  const fp = { overriddenLabel: 'override', resetLabel: 'reset', invalidLabel: 'invalid', disabled: d }
  return (
    <PluginSettingsCard title="活动热力图" description="侧边栏热力图：主题、显示开关与数据选项" state={state} onSave={props.save} onDiscard={props.discard}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, marginBottom: 8 }}>
        <span style={{ opacity: 0.7, minWidth: 50 }}>主题</span>
        {['blue', 'green'].map(t => (
          <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', opacity: state.theme.text === t || (!state.theme.text && t === 'blue') ? 1 : 0.5 }}>
            <input type="radio" name="heatmap-theme" value={t} checked={state.theme.text === t || (!state.theme.text && t === 'blue')} disabled={d} onChange={() => props.edit('theme', t)} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: t === 'blue' ? '#3182bd' : '#40c463', display: 'inline-block' }} />
            <span>{t === 'blue' ? '蓝色' : '绿色'}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input type="checkbox" checked={state.enabled.text === 'true' || (!state.enabled.text)} disabled={d} onChange={() => props.edit('enabled', state.enabled.text === 'true' ? 'false' : 'true')} />
          <span>启用</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginLeft: 12 }}>
          <input type="checkbox" checked={state.includeMerges.text === 'true'} disabled={d} onChange={() => props.edit('includeMerges', state.includeMerges.text === 'true' ? 'false' : 'true')} />
          <span>计入合并提交</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'center' }}>
        <span style={{ opacity: 0.7 }}>USD→CNY 汇率（0=关闭）</span>
        <input type="number" style={{ width: 60, padding: '2px 6px', fontSize: 11, border: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.3))', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-2, transparent)', color: 'var(--dsw-alias-label-primary, inherit)' }} value={state.usdCnyRate.text} disabled={d} onChange={e => props.edit('usdCnyRate', e.target.value)} placeholder="0" />
      </div>
    </PluginSettingsCard>
  )
}
