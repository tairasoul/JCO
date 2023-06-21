import { exec, execSync } from 'child_process';
import { default as axios } from 'axios';
import fs from 'fs';
import chalk from 'chalk';

// thanks stackoverflow https://stackoverflow.com/questions/72208532/install-npm-package-programmatically-after-npm-decision-to-drop-programmatic-api

const run = async (cmd) => {
    const child = exec(cmd, (err) => {
        if (err) console.error(err);
    });
    child.stderr.pipe(process.stderr);
    child.stdout.pipe(process.stdout);
    await new Promise((resolve) => child.on('close', resolve));
};

const test = async (cmd) => {
    try {
        execSync(cmd);
        return true
    }
    catch {
        return false
    }
}

const __dirname = "C:/JCO";

const baseURL = "https://raw.githubusercontent.com/fheahdythdr/JCO/main/";

const files = [
    "src/main.ts",
    "src/lib/searcher.ts",
    "src/definitions/index.ts",
    "src/definitions/interfaces.ts",
    "tsconfig.json",
    "package.json"
]

fs.mkdirSync(`${__dirname}/build/src`, {recursive: true});
fs.mkdirSync(`${__dirname}/build/src/lib`, {recursive: true});
fs.mkdirSync(`${__dirname}/build/src/definitions`, {recursive: true})

console.log(chalk.bold.green("Downloading necessary files."))
for (const file of files) {
    const data = (await axios.get(baseURL + file)).data;
    console.log(chalk.bold.green(`Downloading ${file}.`))
    if (typeof data == "object") fs.writeFileSync(`${__dirname}/build/${file}`, JSON.stringify(data));
    else fs.writeFileSync(`${__dirname}/build/${file}`, data);
    console.log(chalk.bold.green(`Downloaded ${file}, waiting 1 second.`))
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

console.log(chalk.bold.blue("Getting package.json data."))

const packagedata = JSON.parse(fs.readFileSync(`${__dirname}/build/package.json`, 'utf8'));
fs.rmSync(`${__dirname}/build/package.json`)

let toInstall = "";

for (const entry of Object.keys(packagedata.devDependencies)) {
    toInstall += `${entry} `
}

for (const entry of Object.keys(packagedata.dependencies)) {
    if (entry != "rfo.js") toInstall += `${entry} `;
}

console.log(chalk.bold.blue("Installing all necessary packages."))

await run(`cd ${__dirname}/build && npm install ${toInstall.trim()}`);

await run(`cd ${__dirname}/build && npm install git+https://github.com/rbxflags/js-api`)

if (!test("tsc -v")) await run("npm install tsc")

console.log(chalk.bold.blue("Building from source."))

execSync(`cd ${__dirname}/build && tsc`);

console.log(chalk.bold.blue("Removing unnecessary files."))

fs.rmSync(`${__dirname}/build/src`, {recursive: true});
fs.rmSync(`${__dirname}/build/node_modules`, {recursive: true});
fs.rmSync(`${__dirname}/build/package-lock.json`, {recursive: true});
fs.rmSync(`${__dirname}/build/package.json`, {recursive: true});
fs.rmSync(`${__dirname}/build/tsconfig.json`, {recursive: true});

try {
    console.log(chalk.bold.red("Removing outdated files."))
    fs.rmdirSync(`${__dirname}/Main/main.js`, {recursive: true, force: true});
    fs.rmdirSync(`${__dirname}/Main/lib/searcher.js`, {recursive: true, force: true});
    fs.rmdirSync(`${__dirname}/Main/definitions/index.js`, {recursive: true, force: true});
    fs.rmdirSync(`${__dirname}/Main/definitions/interfaces.js`, {recursive: true, force: true});
} catch {}

console.log(chalk.bold.red("Moving new files."))

function copy(file) {
    try {
        fs.copyFileSync(`${__dirname}/build/dist/${file}`, `${__dirname}/Main/${file}`);
    } catch {}
}

copy("main.js");
fs.mkdirSync(`${__dirname}/Main/lib`);
fs.mkdirSync(`${__dirname}/Main/definitions`);
copy("lib/searcher.js");
copy("definitions/index.js");
copy("definitions/interfaces.js");

console.log(chalk.bold.green("Moved files."));
console.log(chalk.bold.green("Removing build dir."));
fs.rmSync(`${__dirname}/build`, {recursive: true});

fs.writeFileSync(`${__dirname}/Main/package.json`, JSON.stringify(packagedata));

await run(`cd ${__dirname}/Main && npm i`);
