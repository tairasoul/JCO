var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as src from './all/all.js';
import inquirer from 'inquirer';
import interrupt from 'inquirer-interrupted-prompt';
interrupt.fromAll(inquirer);
import nfd from '@fheahdythdr/node-file-dialog';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const Settings = new src.current(path.join(__dirname, "../", "current", "settings.json"));
let JCOActive = fs.readFileSync(path.join(__dirname, "../current/active.txt"), "utf8") == "t";
const modes = {
    "Import previous ClientAppSettings.json": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const dialogcfg = {
                    dialogtype: "open-file",
                    title: "Select ClientAppSettings.json",
                    types: [
                        {
                            display: "json files",
                            extensions: "*.json"
                        },
                        {
                            display: "all files",
                            extensions: "*.*"
                        }
                    ]
                };
                const path = (yield nfd.dialog(dialogcfg))[0];
                const json = JSON.parse(fs.readFileSync(path, 'utf8'));
                for (const key of Object.keys(json)) {
                    Settings.add("enabled", key, json[key]);
                }
                Settings.save();
            }
            catch (_a) { }
            main();
        })
    },
    "Add item": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            const item = yield (yield inquirer.prompt({ type: "input", message: "Enter the FVar name: ", name: "item" })).item;
            const isNumber = (item.includes("FInt") ? "integer" : item.includes("FFlag") ? "boolean" : "string");
            const setTo = yield (yield inquirer.prompt({ type: (isNumber == "integer" ? "number" : isNumber == "boolean" ? "confirm" : "input"), message: (isNumber == "integer" ? "Enter the number to set the FInt to: " : isNumber == "boolean" ? "Is the FFlag true or false?" : "What should the FString be set to? "), name: "item" })).item;
            Settings.add("enabled", item, setTo);
            Settings.save();
            main();
        })
    },
    "Remove item from list": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            const items = Settings.settings.enabled.concat(Settings.settings.disabled).map((val) => `${val.id} - ${val.set}`);
            const item = yield (yield inquirer.prompt({ type: 'list', message: "What item should we remove? ", name: "item", choices: items })).item;
            const newItem = item.split(" - ")[0];
            for (const setting of Settings.settings.enabled) {
                if (setting.id == newItem) {
                    Settings.settings.enabled.splice(Settings.settings.enabled.indexOf(setting), 1);
                }
            }
            for (const setting of Settings.settings.disabled) {
                if (setting.id == newItem) {
                    Settings.settings.disabled.splice(Settings.settings.disabled.indexOf(setting), 1);
                }
            }
            Settings.save();
            main();
        })
    },
    "Clear enabled": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            Settings.settings.enabled.splice(0, 99999);
            Settings.save();
            main();
        })
    },
    "Clear disabled": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            Settings.settings.disabled.splice(0, 99999);
            Settings.save();
            main();
        })
    },
    "Set an item to value": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            const items = Settings.settings.disabled.concat(Settings.settings.enabled).map((val) => `${val.id} - ${val.set}`);
            const item = yield (yield inquirer.prompt({ type: 'list', message: "What item value should we change? ", name: "item", choices: items })).item;
            const newItem = item.split(" - ")[0];
            const setting = yield (yield inquirer.prompt({ type: (item.includes("FInt") ? "number" : item.includes("FFlag") ? "confirm" : "input"), name: "value", message: "Enter the value to set " + newItem + " to. Previous value: " + item.split(" - ")[1] })).value;
            Settings.settings.disabled.forEach((val) => {
                if (val.id == newItem)
                    val.set = setting;
            });
            Settings.settings.enabled.forEach((val) => {
                if (val.id == newItem)
                    val.set = setting;
            });
            Settings.save();
            main();
        })
    },
    "Enable item": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            const items = Settings.settings.disabled.map((val) => `${val.id} - ${val.set}`);
            const item = yield (yield inquirer.prompt({ type: 'list', message: "What item should we enable? ", name: "item", choices: items })).item;
            const newItem = item.split(" - ")[0];
            Settings.enable(newItem);
            Settings.save();
            main();
        })
    },
    "Disable item": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            const items = Settings.settings.enabled.map((val) => `${val.id} - ${val.set}`);
            const item = yield (yield inquirer.prompt({ type: 'list', message: "What item should we disable? ", name: "item", choices: items })).item;
            const newItem = item.split(" - ")[0];
            Settings.disable(newItem);
            Settings.save();
            main();
        })
    },
    "Enable": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            fs.writeFileSync(path.join(__dirname, "../", "current", "active.txt"), "t");
            JCOActive = true;
            main();
        })
    },
    "Disable": {
        execute: () => __awaiter(void 0, void 0, void 0, function* () {
            fs.writeFileSync(path.join(__dirname, "../", "current", "active.txt"), "f");
            JCOActive = false;
            main();
        })
    }
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const choices = Object.keys(modes);
        const prompt = yield (yield inquirer.prompt({ type: "list", message: "Select a mode. JCO is currently " + (JCOActive ? "enabled." : "disabled."), name: "item", choices: choices, loop: false })).item;
        const mode = modes[prompt];
        yield mode.execute();
    });
}
main();
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const RobloxVersion = yield src.utils.getRobloxVersion();
    const folders = src.utils.getRobloxFolders();
    for (const folder of folders) {
        const path = `${folder}/versions/${RobloxVersion}/ClientSettings`;
        if (JCOActive) {
            if (!fs.existsSync(path))
                fs.mkdirSync(path);
            fs.writeFileSync(`${path}/ClientAppSettings.json`, Settings.toJSON());
        }
        else {
            if (fs.existsSync(path))
                fs.rmSync(path, { recursive: true });
        }
    }
}), 2000);
