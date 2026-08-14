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
import type { Context } from '@deepseek-ai/cordis';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'settings.plugin.item': {
            kind: 'list';
            scope: 'root';
            owner: SettingsPluginItemOwnerProps;
        };
    }
}
export interface SettingsPluginItemOwnerProps {
    children?: never;
}
export declare const inject: string[];
export declare function apply(ctx: Context): void;
