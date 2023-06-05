import fs from "fs";
export default class CurrentSettings {
    constructor(jsonPath) {
        this.settings = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        this.jsonPath = jsonPath;
    }
    enable(id) {
        for (const setting of this.settings.disabled) {
            if (setting.id == id) {
                this.settings.enabled.push(setting);
                this.settings.disabled.splice(this.settings.disabled.indexOf(setting), 1);
            }
        }
    }
    disable(id) {
        for (const setting of this.settings.enabled) {
            if (setting.id == id) {
                this.settings.disabled.push(setting);
                this.settings.enabled.splice(this.settings.enabled.indexOf(setting), 1);
            }
        }
    }
    save() {
        fs.writeFileSync(this.jsonPath, JSON.stringify(this.settings, null, 2));
    }
    read() {
        this.settings = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));
    }
    set(id, setTo) {
        for (const settingType in this.settings) {
            for (const setting of (settingType == "enabled" ? this.settings.enabled : this.settings.disabled)) {
                if (setting.id == id) {
                    (settingType == "enabled" ? this.settings.enabled : settingType == "disabled" ? this.settings.disabled : this.settings.enabled).forEach((element) => {
                        if (element.id == id)
                            element.set = setTo;
                    });
                }
            }
        }
    }
    add(tbl, id, set) {
        (tbl == "enabled" ? this.settings.enabled : this.settings.disabled).push({
            id: id,
            set: set
        });
    }
    toJSON() {
        const mapped = {};
        for (const item of this.settings.enabled) {
            mapped[item.id] = item.set;
        }
        return JSON.stringify(mapped, null, 2);
    }
}
