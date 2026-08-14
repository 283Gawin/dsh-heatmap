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
import type { HeatmapPanel } from './heatmap.ts';
/**
 * Mount the heatmap panel at the bottom of the sidebar, waiting for the
 * shell to render and self-healing on later React re-renders.
 * @param panel - the panel to mount (already built).
 * @returns disposer removing the panel and its observers.
 */
export declare function mountSidebarPanel(panel: HeatmapPanel): () => void;
