import { Setting } from "./setting";

export interface Settings {
    enabled: Setting[];
    disabled: Setting[];
    custom: Setting[];
}