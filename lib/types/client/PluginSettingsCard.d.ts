import { type ReactNode } from 'react';
import type { CardShell } from './settings-form.ts';
export interface PluginSettingsCardProps {
    title: string;
    description: string;
    state: CardShell;
    onSave: () => void;
    onDiscard: () => void;
    children: ReactNode;
}
export declare function PluginSettingsCard(props: PluginSettingsCardProps): import("react").JSX.Element | null;
