import { Platform } from "rfo.js/dist/MiscTypes";
import fs from 'fs';
import { default as axios } from 'axios';

const paths = {
    windows: [
        'C:/Program Files/Roblox/versions/',
        'C:/Program Files (x86)/Roblox/versions/',
        `${process.env.localappdata}/Roblox/versions/`,
        `${process.env.appdata}/Roblox/versions/`,
    ].filter(v => v),
    macos: [
        process.env.ROBLOXVERSION!,
        process.env.ROBLOX!,
        '/Applications/Roblox.app/Contents/MacOS',
        '/Applications/Roblox.app/Contents/',
    ].filter(v => v),
    linux: [
        process.env.ROBLOXVERSION!,
        `${process.env.ROBLOX}/versions/`,
    ].filter(v => v),
}

export class Searcher {
    public async searchVersions(platform: Platform): Promise<string[]> {
        const versionDirectories: string[] = [];

        const searchPaths = paths[platform.toLowerCase() === 'darwin' ? 'macos' : platform.toLowerCase() == "win32" ? 'windows' : platform.toLowerCase()];
        if (!searchPaths)
            throw new Error(`Unsupported platform: ${platform}`);

        for (const searchPath of searchPaths) {
            const version = (await axios.get("https://setup.rbxcdn.com/version")).data;
            if (fs.existsSync(`${searchPath}${version}`)) {
                versionDirectories.push(`${searchPath}${version}`)
            }
        }

        return versionDirectories;
    }
}
