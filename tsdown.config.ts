/**
 * tsdown config for the activity-heatmap client plugin.
 *
 * Self-contained build: the shared client-bundle preset (shared/tsdown.client.ts -
 * closure-factory artifact for window.__ModuleLoader__, CSS Modules inlined,
 * externals resolved through the loader module table) is vendored inside this
 * package so the plugin builds standalone. The node half builds from src
 * (tsdown compiles TS directly) and types ship from lib/types (tsc).
 */
import { clientBundle } from './shared/tsdown.client.ts'

export default clientBundle('@linxin666/dsh-client-ui-activity-heatmap', ['src/index.ts'], {
  libExternal: ['@deepseek-ai/schemastery'],
})