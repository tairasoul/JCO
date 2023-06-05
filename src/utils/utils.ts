import crypto from 'crypto';
import fs from 'fs';
import {default as axios} from 'axios';

function getMD5(file: string, name: string) {
    const promise: Promise<{name: string, hash: Buffer}> = new Promise((resolve, reject) => {
        const stream = fs.createReadStream(file);
        const hash = crypto.createHash('md5', {encoding: "binary"});
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve({name: name, hash: hash.digest()}));
    })
    return promise
}

export async function getMD5s(...files: {path: string, name: string}[]) {
    const funcs = new Array;
    for (const prop in files) {
        const file = files[prop];
        funcs.push(getMD5(file.path, file.name));
    }
    return await Promise.all(funcs);
}

export async function getRobloxVersion() {
    const version: string = (await axios.get("https://setup.rbxcdn.com/version")).data;
    return version
}

export function getRobloxFolders() {
    const folders = new Array<string>;
    if (fs.existsSync('C:/Program Files (x86)/Roblox')) folders.push('C:/Program Files (x86)/Roblox');
    if (fs.existsSync(`${process.env.LOCALAPPDATA}/Roblox`)) folders.push(`${process.env.LOCALAPPDATA}/Roblox`);
    return folders
}

export default {
    getRobloxVersion,
    getMD5s,
    getMD5,
    getRobloxFolders
}
