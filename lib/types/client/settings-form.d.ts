import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
export interface FieldSpec {
    field: string;
    format: (v: unknown) => string;
    parse: (t: string) => FieldWrite | undefined;
}
export type FieldWrite = {
    kind: 'set';
    value: unknown;
} | {
    kind: 'clear';
};
export interface FieldState {
    text: string;
    overridden: boolean;
    invalid: boolean;
}
export interface CardShell {
    available: boolean;
    exposed: boolean;
    writable: boolean;
    dirty: boolean;
    invalid: boolean;
    saving: boolean;
    failed: boolean;
}
export interface CardActions {
    edit: (f: string, t: string) => void;
    resetField: (f: string) => void;
    save: () => void;
    discard: () => void;
}
export declare function booleanField(field: string): FieldSpec;
export declare function stringField(field: string, valid?: (v: string) => boolean): FieldSpec;
export declare function numberField(field: string): FieldSpec;
export declare class CardForm<T> {
    private readonly scope;
    private readonly specs;
    private readonly staged;
    private readonly listeners;
    private saving;
    private failed;
    constructor(scope: SettingsScope<T>, specs: FieldSpec[]);
    bind<S>(project: () => S): SnapshotStore<S>;
    shell(): CardShell;
    field(field: string): FieldState;
    actions(): CardActions;
    private save;
    private plan;
    private publish;
}
