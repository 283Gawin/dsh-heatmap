import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import { type CardActions, type CardShell, type FieldState } from './settings-form.ts';
export interface HeatmapSettings {
    theme?: string;
    enabled?: boolean;
    includeMerges?: boolean;
    usdCnyRate?: number;
}
export interface HeatmapSettingsCardState extends CardShell {
    theme: FieldState;
    enabled: FieldState;
    includeMerges: FieldState;
    usdCnyRate: FieldState;
}
export interface HeatmapSettingsCardFace extends CardActions {
    hooks: {
        heatmapSettingsCard: SnapshotStore<HeatmapSettingsCardState>;
    };
}
export declare class HeatmapSettingsCardController {
    private readonly form;
    private readonly store;
    constructor(scope: SettingsScope<HeatmapSettings>);
    inject(): HeatmapSettingsCardFace;
}
export type HeatmapSettingsCardProps = PropsRuntime<'settings.plugin.item'> & InjectFace<HeatmapSettingsCardFace>;
export declare function HeatmapSettingsCard(props: HeatmapSettingsCardProps): import("react").JSX.Element;
