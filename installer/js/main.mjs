import { default as axios } from 'axios';
import fs from 'fs';
import { exec } from 'child_process'

function check(path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
}

check("C:/JCO/Main");
check("C:/JCO/Updater");

const baseURL = "https://raw.githubusercontent.com/fheahdythdr/JCO/main/";

const run = async (cmd, dir) => {
    const child = exec(cmd, {cwd: dir}, (err) => {
        if (err) console.error(err);
    });
    child.stderr.pipe(process.stderr);
    child.stdout.pipe(process.stdout);
    await new Promise((resolve) => child.on('close', resolve));
};

const get = async (path) => {
    const url = `${baseURL}/${path}`;
    const data = (await axios.get(url)).data;
    return data;
}

const write = async (base, data) => {
    const path = `C:/JCO/${base}`;
    if (typeof data == 'object') fs.writeFileSync(path, JSON.stringify(data));
    else fs.writeFileSync(path, data);
}

const prerun = await get("updater/js/prerun.mjs");

await write("Updater/prerun.mjs", prerun);

const main = await get("updater/js/main.mjs");

await write("Updater/main.mjs", main);

await run('node prerun.mjs && node main.mjs', 'C:/JCO/Updater');
