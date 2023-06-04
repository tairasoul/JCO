import fs from "fs";
import utils from "../utils/utils";

export default class SettingsMover {
    source: string;

    constructor(src: string) {
        this.source = src;
    }

    async move(file: string) {
        const version: string = await utils.getRobloxVersion();
        const roblox: string[] = utils.getRobloxFolders();
        for (const folder of roblox) {
            const path = `${folder}/Versions/${version}`;
            fs.copyFileSync(file, `${path}/ClientSettings/ClientAppSettings.json`);
        }
    }

    async del() {
        const version: string = await utils.getRobloxVersion();
        const roblox: string[] = utils.getRobloxFolders();
        for (const folder of roblox) {
            const path = `${folder}/Versions/${version}`;
            fs.rmSync(`${path}/ClientSettings/`, {recursive: true});
        }
    }
}