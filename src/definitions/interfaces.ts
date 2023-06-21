import * as defs from './index'

export interface InquirerConfig {
    name: string;
    type: "checkbox" | "confirm" | "editor" | "expand" | "list" | "number" | "password" | "rawlist" | "input";
    loop: boolean;
    interruptedKeyName?: string;
    message: string;
    choices?: string[]
}

export interface DefaultData {
    preprocessed: defs.ProcessorTypes.ProcessedFlagList[];
    enabled: {
        Rendering: {
            enabled: boolean;
            LightingValue: string;
            RendererValue: string;
        };
        Experimental: {
            enabled: boolean;
            value: string[];
        };
        Privacy: {
            enabled: boolean;
            value: string;
        };
    };
    setup: boolean;
}
