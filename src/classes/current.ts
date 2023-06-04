import fs from "fs";
import { Settings } from "../interfaces/settings";
import { Setting } from "../interfaces/setting";

export default class CurrentSettings {
    settings: Settings;

    constructor(jsonPath: string | undefined) {
        if (jsonPath) {
            if (fs.existsSync(jsonPath)) {
                this.settings = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            }
        }
    }

    enable(id: string) {
        for (const setting of this.settings.disabled) {
            if (setting.id == id) {
                this.settings.enabled.push(setting);
                this.settings.disabled.filter((val) => val.id != id);
            }
        }
    }


    disable(id: string) {
        for (const setting of this.settings.disabled) {
            if (setting.id == id) {
                this.settings.disabled.push(setting);
                this.settings.enabled.filter((val) => val.id != id);
            }
        }
    }

    save(path: string) {
        fs.writeFileSync(path, JSON.stringify(this.settings));
    }

    read(path: string) {
        this.settings = JSON.parse(fs.readFileSync(path, 'utf8'));
    }

    set(id: string, setTo: string | number) {
        for (const settingType in this.settings) {
            for (const setting of this.settings[settingType]) {
                if (setting.id == id) {
                    this.settings[settingType].forEach((element: Setting) => {
                        if (element.id == id) element.set = setTo;
                    })
                }
            }
        }
    }

    addCustom(id: string, set: string | number) {
        this.settings.custom.push(
            {
                id: id,
                set: set
            }
        )
    }
}