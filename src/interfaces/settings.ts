import { Setting } from "./setting.js";

export interface Settings {
    enabled: Setting[];
    disabled: Setting[];
}
