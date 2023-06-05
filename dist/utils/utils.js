var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import crypto from 'crypto';
import fs from 'fs';
import { default as axios } from 'axios';
function getMD5(file, name) {
    const promise = new Promise((resolve, reject) => {
        const stream = fs.createReadStream(file);
        const hash = crypto.createHash('md5', { encoding: "binary" });
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve({ name: name, hash: hash.digest() }));
    });
    return promise;
}
export function getMD5s(...files) {
    return __awaiter(this, void 0, void 0, function* () {
        const funcs = new Array;
        for (const prop in files) {
            const file = files[prop];
            funcs.push(getMD5(file.path, file.name));
        }
        return yield Promise.all(funcs);
    });
}
export function getRobloxVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const version = (yield axios.get("https://setup.rbxcdn.com/version")).data;
        return version;
    });
}
export function getRobloxFolders() {
    const folders = new Array;
    if (fs.existsSync('C:/Program Files (x86)/Roblox'))
        folders.push('C:/Program Files (x86)/Roblox');
    if (fs.existsSync(`${process.env.LOCALAPPDATA}/Roblox`))
        folders.push(`${process.env.LOCALAPPDATA}/Roblox`);
    return folders;
}
export default {
    getRobloxVersion,
    getMD5s,
    getMD5,
    getRobloxFolders
};
