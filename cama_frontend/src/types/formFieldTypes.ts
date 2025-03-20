export interface BaseField {
    name: string;
    key: string;
    desc: string;
    type: "string" | "number" | "option" | "checkbox" | "disabled" | "multiline";
    width?: string;
}

export interface ExperimentField extends BaseField {
    options?: string[];
    database_name?: string;
}

export interface EffectField extends BaseField {
    options?: string[];
    database_name?: string;
}