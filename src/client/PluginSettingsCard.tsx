import { useState, type ReactNode } from 'react'
import type { CardShell } from './settings-form.ts'
import css from './settings-card.module.css'
export interface PluginSettingsCardProps { title: string; description: string; state: CardShell; onSave: () => void; onDiscard: () => void; children: ReactNode }
export function PluginSettingsCard(props: PluginSettingsCardProps) {
  const [open, setOpen] = useState(false); const { state } = props
  if (!state.available) return null
  if (!state.exposed) return (<li className={css.card}><button type="button" className={css.header} onClick={() => setOpen(!open)}><span className={css.headText}><span className={css.name}>{props.title}</span><span className={css.desc}>{props.description}</span></span><span className={open ? css.chevOpen : css.chev}>▾</span></button>{open ? <div className={css.body}><p className={css.note}>当前 DSH 版本未向设置页暴露本插件的配置命名空间，表单不可用。可编辑 ~/.dsh/settings.yaml 直接配置。</p></div> : null}</li>)
  return (<li className={css.card}><button type="button" className={css.header} onClick={() => setOpen(!open)}><span className={css.headText}><span className={css.name}>{props.title}</span><span className={css.desc}>{props.description}</span></span><span className={open ? css.chevOpen : css.chev}>▾</span></button>{open ? <div className={css.body}>{props.children}<div className={css.actions}><button type="button" className={css.save} disabled={!state.dirty || state.invalid || state.saving} onClick={props.onSave}>{state.saving ? '...' : '保存'}</button><button type="button" className={css.discard} disabled={!state.dirty || state.saving} onClick={props.onDiscard}>放弃修改</button></div>{state.failed ? <p className={css.failed}>保存失败。</p> : null}</div> : null}</li>)
}
