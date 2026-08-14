/**
 * Sidebar panel injection.
 *
 * dsh's sidebar shell exposes no slot an external plugin can register into
 * (`sidebar.workspaces` / `sidebar.settings` are single-occupant and already
 * taken), so — following the skin and sibling-plugin precedent of DOM-level
 * extension — the heatmap panel is appended to the BOTTOM of the sidebar
 * root (below the workspace browser, GitHub-widget style). The injection
 * self-heals: a MutationObserver watches the sidebar root and re-appends the
 * panel whenever a React re-render displaces it (re-insertion happens in the
 * same frame, before paint, so no flicker).
 *
 * Root discovery tolerates several shell shapes: a `data-pane="sidebar"`
 * column (stamped by the web-ui compat shim), a css-module `*_sidebarCol`
 * column, and the logo-row owner inside it. Each re-render re-validates the
 * cached root and falls back to a fresh query when the tree is rebuilt.
 *
 * @module dsh-activity-heatmap/client/sidebar
 */

import type { HeatmapPanel } from './heatmap.ts'

/** Candidate selectors for the sidebar column, most specific first. */
const COLUMN_SELECTORS = [
  '[data-pane="sidebar"]',
  '[class*="sidebarCol"]',
  '[class*="sidebar-column"]',
] as const

/** Find the sidebar shell root element, or undefined while not yet mounted. */
function sidebarRoot(): HTMLElement | undefined {
  let column: HTMLElement | null = null
  for (const selector of COLUMN_SELECTORS) {
    column = document.querySelector<HTMLElement>(selector)
    if (column !== null) break
  }
  if (column === null) return undefined
  // Prefer the element that owns the logo row — the real sidebar UI root —
  // and fall back to the column's first child for legacy shells.
  const logoOwner = column.querySelector<HTMLElement>('[class*="logoRow"]')?.parentElement
  return logoOwner ?? (column.firstElementChild as HTMLElement | undefined)
}

/**
 * Mount the heatmap panel at the bottom of the sidebar, waiting for the
 * shell to render and self-healing on later React re-renders.
 * @param panel - the panel to mount (already built).
 * @returns disposer removing the panel and its observers.
 */
export function mountSidebarPanel(panel: HeatmapPanel): () => void {
  let root: HTMLElement | undefined
  let placed = false
  let rootObserver: MutationObserver | undefined

  const place = (): boolean => {
    if (root === undefined) return false
    if (panel.element.parentElement === root) return true
    // Bottom of the sidebar: appended after the shell's own trailing blocks.
    root.appendChild(panel.element)
    return true
  }

  const tryPlace = (): void => {
    if (root !== undefined && !root.isConnected) {
      rootObserver?.disconnect()
      root = undefined
      placed = false
    }
    if (placed) {
      if (document.body.contains(panel.element)) return
      rootObserver?.disconnect()
      root = undefined
      placed = false
    }
    root ??= sidebarRoot()
    if (root === undefined) return
    placed = place()
    if (placed) {
      rootObserver ??= new MutationObserver(() => {
        if (root === undefined || !root.isConnected) {
          placed = false
          tryPlace()
          return
        }
        if (!root.contains(panel.element)) place()
      })
      rootObserver.observe(root, { childList: true, subtree: true })
    }
  }

  // Body-level watcher as the whole-rebuild fallback.
  const waitObserver = new MutationObserver(() => { tryPlace() })
  waitObserver.observe(document.body, { childList: true, subtree: true })

  tryPlace()

  return () => {
    waitObserver.disconnect()
    rootObserver?.disconnect()
    panel.element.remove()
  }
}
