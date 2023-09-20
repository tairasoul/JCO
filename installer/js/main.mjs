import fs from 'fs';
import { exec, execFile, execSync } from 'child_process'
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));

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

const write = async (path, url) => {
    const fullURL = `${baseURL}${url}`;
    return new Promise((resolve) => {
        https.get(fullURL, (res) => {
            const stream = fs.createWriteStream(`C:/JCO/${path}`);
            res.pipe(stream);
            stream.on('close', resolve);
        })
    })
}

await write("Updater/prerun.mjs", "updater/js/prerun.mjs");

await write("Updater/main.mjs", "updater/js/main.mjs");

if (!fs.existsSync("C:/JCO/Runner/Frontend.exe")) await write("Runner/Frontend.exe", "Frontend.exe");

await write("Main/data/icon.ico", "other/JCOIcon.ico");

await write("Main/data/icon.png", "other/JCOIcon.png")

await write("Main/setup.js", "setup.js");

console.log("Setting up JCO. Once done, if you want to remove JCO from startup, run uninstall.bat. JCO itself will still be in your C: drive.")

await run('node prerun.mjs && node main.mjs', 'C:/JCO/Updater');

await run("node setup", 'C:/JCO/Main');

if (fs.existsSync(`${process.env.appdata}/Microsoft/Windows/Start Menu/Programs/Start-up/JCO.bat`)) fs.rmSync(`${process.env.appdata}/Microsoft/Windows/Start Menu/Programs/Start-up/JCO.bat`);

const tempbat = `${__dirname}/setup.bat`;

fs.writeFileSync(tempbat, 'reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v JCO /t REG_SZ /d C:\\JCO\\Runner\\run.bat /f');

execSync(tempbat);

fs.rmSync(tempbat);

const uninstallbat = `${__dirname}/uninstall.bat`;

fs.writeFileSync(uninstallbat, "reg delete HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v JCO /f");

try {
    fs.mkdirSync(`C:/JCO/Installer`);
} catch {}

fs.copyFileSync(`${__dirname}/main.mjs`, `C:/JCO/Installer/main.mjs`);

fs.copyFileSync(`${__dirname}/prerun.mjs`, `C:/JCO/Installer/prerun.mjs`);

fs.writeFileSync(`C:/JCO/Installer/run.bat`, 
`
cd /d C:/JCO/Installer

node %cd%/prerun.mjs

node %cd%/main.mjs

cd C:/JCO/Runner

start Frontend.exe`
)

fs.writeFileSync('C:/JCO/Runner/run.bat', 
`
cd C:/JCO/Runner

start Frontend.exe`
)

try {
    fs.mkdirSync(`C:/JCO/Main/flaglists`);

    fs.symlinkSync('C:/JCO/Main/flaglists', 'C:/JCO/CustomFlaglists');
} catch {}

process.exit(0);
