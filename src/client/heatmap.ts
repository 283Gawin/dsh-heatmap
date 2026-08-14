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

import { HEATMAP_DAYS, type DayUsage, type HeatmapMetric, type HeatmapPayload, type HeatmapTheme, type HeatmapView } from '../core/types.ts'
import css from './styles.module.css'

/** Poll interval for the stats endpoint. */
const POLL_MS = 60_000

const METRIC_KEY = 'dsh.activityHeatmap.metric'
const VIEW_KEY = 'dsh.activityHeatmap.view'
const THEME_KEY = 'dsh.activityHeatmap.theme'
const COLLAPSED_KEY = 'dsh.activityHeatmap.collapsed'

/** Stable selector identifying the mounted panel (self-heal + tests). */
export const PANEL_SELECTOR = '[data-dsh-heatmap-panel]'

/** Bumped on every client rewrite so a stale cached bundle is easy to spot. */
export const PANEL_VERSION = '2'

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(Math.round(n))
}

function formatUsd(n: number): string {
  if (n === 0) return '$0'
  if (n < 0.01) return '$' + n.toExponential(1)
  if (n < 100) return '$' + n.toFixed(2)
  return '$' + n.toFixed(1)
}

function billed(day: DayUsage): number {
  return day.inputTokens + day.cacheReadTokens + day.cacheWriteTokens + day.outputTokens
}

function dayCost(day: DayUsage): number {
  return Object.values(day.modelCostUsd).reduce((s, u) => s + u, 0)
}

function dayValue(day: DayUsage, m: HeatmapMetric): number {
  switch (m) {
    case 'commits': return day.commits
    case 'tokens': return billed(day)
    case 'cost': return dayCost(day)
  }
}

function parseDate(key: string): Date {
  const [y, mo, d] = key.split('-').map(Number)
  return new Date(y, mo - 1, d)
}

/** Slice the payload to the trailing window. */
function windowDays(payload: HeatmapPayload): DayUsage[] {
  return payload.days.slice(Math.max(0, payload.days.length - HEATMAP_DAYS))
}

/** Grid cell levels per view mode; one number per day cell (0 = empty). */
function computeValues(days: DayUsage[], metric: HeatmapMetric, view: HeatmapView): number[] {
  if (view === 'cumulative') {
    let sum = 0
    return days.map(d => { sum += dayValue(d, metric); return sum })
  }
  if (view === 'weekly') {
    const weekTotals = new Map<number, number>()
    for (let i = 0; i < days.length; i++) {
      const week = Math.floor(i / 7)
      weekTotals.set(week, (weekTotals.get(week) ?? 0) + dayValue(days[i], metric))
    }
    return days.map((_, i) => weekTotals.get(Math.floor(i / 7)) ?? 0)
  }
  return days.map(d => dayValue(d, metric))
}

/** Level0..4 for a value on a log scale. */
function level(value: number, maxLog: number): number {
  if (value <= 0 || maxLog <= 0) return 0
  return 1 + Math.floor(Math.min(1, Math.log10(value) / maxLog) * 3.999)
}

function tooltip(day: DayUsage, metric: HeatmapMetric, value: number): string {
  const lines = [day.date]
  lines.push('commits: ' + day.commits)
  lines.push('tokens: ' + billed(day).toLocaleString('en-US'))
  const cost = dayCost(day)
  if (cost > 0) lines.push('cost: ' + formatUsd(cost))
  if (metric !== 'tokens') lines.push(metric + ': ' + value)
  return lines.join('\n')
}

/** The sidebar heatmap panel. Owns its DOM, poll timer, and render state. */
export class HeatmapPanel {
  readonly element: HTMLElement
  private readonly metricBtns = new Map<HeatmapMetric, HTMLButtonElement>()
  private readonly viewBtns = new Map<HeatmapView, HTMLButtonElement>()
  private readonly toolbar: HTMLElement
  private readonly gridEl: HTMLElement
  private readonly labelsEl: HTMLElement
  private readonly todayEl: HTMLElement
  private readonly windowEl: HTMLElement
  private readonly modelEl: HTMLElement
  private readonly statsBlock: HTMLElement
  private readonly statusEl: HTMLElement
  private metric: HeatmapMetric
  private view: HeatmapView
  private theme: HeatmapTheme
  private collapsed: boolean
  private payload: HeatmapPayload | undefined
  private timer: number | undefined
  private disposed = false

  constructor(initialTheme: HeatmapTheme = 'blue') {
    this.metric = readLS(METRIC_KEY, 'commits', v => v === 'commits' || v === 'tokens' || v === 'cost')
    this.view = readLS(VIEW_KEY, 'daily', v => v === 'daily' || v === 'weekly' || v === 'cumulative')
    this.theme = readLS(THEME_KEY, initialTheme, v => v === 'blue' || v === 'green')
    this.collapsed = localStorage.getItem(COLLAPSED_KEY) === '1'

    this.element = document.createElement('div')
    this.element.dataset.dshHeatmapPanel = PANEL_VERSION
    this.element.dataset.metric = this.metric
    this.element.dataset.theme = this.theme
    this.element.className = css.panel

    // ── Header: title left, view tabs right ──
    const header = document.createElement('div')
    header.className = css.header
    header.title = 'Click to collapse/expand'
    const chevron = document.createElement('span')
    chevron.className = css.chevron
    const title = document.createElement('span')
    title.className = css.title
    title.textContent = 'Token 活动'
    header.append(chevron, title)

    const viewGroup = document.createElement('span')
    viewGroup.className = css.viewTabs
    for (const [key, label] of [['daily', '每日'], ['weekly', '每周'], ['cumulative', '累计']] as const) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = css.viewBtn
      btn.textContent = label
      btn.addEventListener('click', () => this.setView(key))
      this.viewBtns.set(key, btn)
      viewGroup.appendChild(btn)
    }
    header.append(viewGroup)
    header.addEventListener('click', (e) => {
      if (e.target === header || e.target === title || e.target === chevron) {
        this.collapsed = !this.collapsed
        localStorage.setItem(COLLAPSED_KEY, this.collapsed ? '1' : '0')
        this.applyCollapsed()
      }
    })

    // ── Metric selector ──
    const toolbar = document.createElement('div')
    toolbar.className = css.toolbar
    const metricGroup = document.createElement('span')
    metricGroup.className = css.metricGroup
    for (const [key, label] of [['commits', '提交'], ['tokens', 'Token'], ['cost', '花费']] as const) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = css.metricBtn
      btn.textContent = label
      btn.addEventListener('click', () => this.setMetric(key))
      this.metricBtns.set(key, btn)
      metricGroup.appendChild(btn)
    }
    // Theme is chosen in the settings page (activity-heatmap namespace), not here.
    toolbar.append(metricGroup)
    this.toolbar = toolbar

    // ── Heatmap grid + month labels ──
    this.gridEl = document.createElement('div')
    this.gridEl.className = css.grid
    this.labelsEl = document.createElement('div')
    this.labelsEl.className = css.labels

    // ── Stats block ──
    const stats = document.createElement('div')
    stats.className = css.stats
    this.todayEl = document.createElement('div')
    this.todayEl.className = css.statsRow
    this.windowEl = document.createElement('div')
    this.windowEl.className = css.statsRow
    this.modelEl = document.createElement('div')
    this.modelEl.className = css.modelLine
    stats.append(this.todayEl, this.windowEl, this.modelEl)
    this.statsBlock = stats

    this.statusEl = document.createElement('div')
    this.statusEl.className = css.status
    this.statusEl.textContent = '统计中…'

    this.element.append(header, toolbar, this.gridEl, this.labelsEl, stats, this.statusEl)
    this.applyCollapsed()
    this.applyButtons()
  }

  /** Begin polling and attach the visibility listener. */
  start(): void {
    void this.refresh()
    this.timer = window.setInterval(() => { void this.refresh() }, POLL_MS)
    document.addEventListener('visibilitychange', this.onVis)
  }

  dispose(): void {
    this.disposed = true
    if (this.timer !== undefined) clearInterval(this.timer)
    document.removeEventListener('visibilitychange', this.onVis)
    this.element.remove()
  }

  private readonly onVis = (): void => {
    if (document.visibilityState === 'visible') void this.refresh()
  }

  private setMetric(m: HeatmapMetric): void {
    if (m === this.metric) return
    this.metric = m
    localStorage.setItem(METRIC_KEY, m)
    this.element.dataset.metric = m
    this.applyButtons()
    this.render()
  }

  private setView(v: HeatmapView): void {
    if (v === this.view) return
    this.view = v
    localStorage.setItem(VIEW_KEY, v)
    this.applyButtons()
    this.render()
  }

  setTheme(t: HeatmapTheme): void {
    if (t === this.theme) return
    this.theme = t
    localStorage.setItem(THEME_KEY, t)
    this.element.dataset.theme = t
    this.applyButtons()
  }

  private applyButtons(): void {
    for (const [k, b] of this.metricBtns) b.classList.toggle(css.active, k === this.metric)
    for (const [k, b] of this.viewBtns) b.classList.toggle(css.active, k === this.view)
  }

  private applyCollapsed(): void {
    const hide = this.collapsed
    for (const el of [this.toolbar, this.gridEl, this.labelsEl, this.statsBlock, this.statusEl]) {
      el.style.display = hide ? 'none' : ''
    }
    this.element.querySelector('.' + css.chevron)?.classList.toggle(css.chevronOpen, hide)
  }

  private async refresh(): Promise<void> {
    if (this.disposed) return
    try {
      const r = await fetch('/activity-heatmap/stats', { headers: { accept: 'application/json' }, cache: 'no-store' })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const env = await r.json() as { ok: boolean; value?: HeatmapPayload }
      if (!env.ok || !env.value) throw new Error('bad')
      this.payload = env.value
      this.statusEl.textContent = ''
      this.render()
    } catch {
      if (!this.disposed) this.statusEl.textContent = '数据不可用'
    }
  }

  private render(): void {
    this.gridEl.replaceChildren()
    this.labelsEl.replaceChildren()
    const p = this.payload
    if (!p) return

    const days = windowDays(p)
    const vals = computeValues(days, this.metric, this.view)
    const maxLog = Math.max(...vals.filter(v => v > 1).map(v => Math.log10(v)), 0)

    // Week-alignment padding: pad first column up to Monday.
    if (days.length > 0) {
      const first = parseDate(days[0].date)
      const pad = (first.getDay() + 6) % 7
      for (let i = 0; i < pad; i++) {
        const cell = document.createElement('div')
        cell.className = css.cell
        this.gridEl.appendChild(cell)
      }
    }

    // Cells
    for (let i = 0; i < days.length; i++) {
      const cell = document.createElement('div')
      cell.className = css.cell
      const lv = level(vals[i], maxLog)
      if (lv > 0) cell.classList.add(css['l' + lv])
      cell.title = tooltip(days[i], this.metric, vals[i])
      this.gridEl.appendChild(cell)
    }

    // Monthly labels
    this.renderLabels(days)

    // Stats block
    const today = p.today
    const hitRate = Math.round(today.cacheHitRate * 1000) / 10
    const cny = today.costUsd > 0 && p.cnyRate > 0 ? ' · ¥' + (today.costUsd * p.cnyRate).toFixed(2) : ''
    this.todayEl.replaceChildren(
      statItem('今日 Token', formatTokens(today.tokens)),
      statItem('缓存命中', hitRate + '%'),
      statItem('今日花费', formatUsd(today.costUsd) + cny),
    )
    let tokens = 0, commits = 0, cost = 0
    for (const d of days) { tokens += billed(d); commits += d.commits; cost += dayCost(d) }
    this.windowEl.replaceChildren(
      statItem('Token 合计', formatTokens(tokens)),
      statItem('提交数', String(commits)),
      statItem('花费合计', formatUsd(cost)),
    )
    if (today.models.length > 0) {
      this.modelEl.textContent = today.models.map(r => r.model + ' ' + formatUsd(r.usd)).join(' · ')
    } else {
      this.modelEl.textContent = ''
    }
  }

  private renderLabels(days: DayUsage[]): void {
    if (days.length === 0) return
    const gridRect = this.gridEl.getBoundingClientRect()
    const gridLeft = gridRect.left
    const cells = Array.from(this.gridEl.children) as HTMLElement[]
    const labels: { text: string; x: number }[] = []
    let lastMonth = ''
    for (let i = 0; i < days.length; i++) {
      const mo = days[i].date.slice(0, 7)
      if (mo !== lastMonth) {
        lastMonth = mo
        const cellIdx = i + ((parseDate(days[0].date).getDay() + 6) % 7)
        const cell = cells[cellIdx]
        if (cell) {
          const rect = cell.getBoundingClientRect()
          const [y, m] = mo.split('-')
          labels.push({ text: parseInt(m) + '\u6708', x: rect.left - gridLeft })
        }
      }
    }
    for (const lbl of labels) {
      const span = document.createElement('span')
      span.className = css.monthLabel
      span.textContent = lbl.text
      span.style.marginLeft = lbl.x + 'px'
      this.labelsEl.appendChild(span)
    }
  }
}

function statItem(label: string, value: string): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = css.statItem
  const l = document.createElement('div')
  l.className = css.statLabel
  l.textContent = label
  const v = document.createElement('div')
  v.className = css.statValue
  v.textContent = value
  wrap.append(l, v)
  return wrap
}

function readLS<T extends string>(key: string, fallback: T, guard: (v: string) => v is T): T {
  try { const v = localStorage.getItem(key); if (v !== null && guard(v)) return v } catch {}
  return fallback
}
