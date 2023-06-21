import { default as axios } from 'axios';
import fs from 'fs';
import { exec, execFile } from 'child_process'
import https from 'https';

function check(path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
}

check("C:/JCO/Main/data");
check("C:/JCO/Updater");
check("C:/JCO/Runner");

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

if (!fs.existsSync(`C:/JCO/Runner/Frontend.exe`)) https.get("https://raw.githubusercontent.com/fheahdythdr/JCO/main/Frontend.exe", (res) => {
    const stream = fs.createWriteStream(`C:/JCO/Runner/Frontend.exe`);
    res.pipe(stream);
})

if (!fs.existsSync(`C:/JCO/Main/data/icon.ico`)) https.get("https://raw.githubusercontent.com/fheahdythdr/JCO/main/other/JCOIcon.ico", (res) => {
    const stream = fs.createWriteStream(`C:/JCO/Main/data/icon.ico`);
    res.pipe(stream);
})

const setup = await get("setup.js");

await write("Main/setup.js", setup);

console.log("Setting up JCO. Once done, if you want to remove JCO from startup, open the run dialog, type shell:startup and remove JCO.bat")

await run('node prerun.mjs && node main.mjs', 'C:/JCO/Updater');

await run("node setup", 'C:/JCO/Main');

execFile("C:/JCO/Runner/Frontend.exe");

process.exit(0);
