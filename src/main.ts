import { RFO } from 'rfo.js/dist/RFO.js'
import inquirer from 'inquirer';
import fs from 'fs-extra';
import childproc from 'child_process'
import { exit } from 'process';
import chalk from 'chalk'
import * as defs from './definitions/index.js';
import interrupt from 'inquirer-interrupted-prompt';
import { Searcher } from './lib/searcher.js'
interrupt.fromAll(inquirer);

const root = "C:\\JCO\\Main";

const searcher = new Searcher();

const rfo = new RFO();

// to make ts happy because different declarations are missing
// @ts-ignore
rfo.versionSearcher = searcher;

const prompt = async (config: defs.interfaces.InquirerConfig) => {
    try {
        const awnser = (await inquirer.prompt(config))[config.name];
        return awnser
    }
    catch {

    }
}

async function checkVersion() {
    if (!fs.existsSync(`${root}/data/commit.jco`)) fs.writeFileSync(`${root}/data/commit.jco`, '');
    try {
        // get latest github commit
        const commit = (await ((await fetch("https://api.github.com/repos/tairasoul/JCO/commits?per_page=1")).json()))[0].sha;
        const ccommit = fs.readFileSync(`${root}/data/commit.jco`, 'utf8');
        if (ccommit != commit) {
            // inform user
            console.log(chalk.bold.red("Updating JCO to github commit " + commit))
            // update and exit after 2 seconds
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    childproc.exec("C:/JCO/Installer/run.bat", () => {});
                    resolve();
                    exit(0);
                }, 2000)
            })
        }
    } catch {
        console.log(chalk.bold.red("Could not get latest JCO commit. JCO will continue anyways."))
    }
}

const data: defs.interfaces.DefaultData = {
    // @ts-ignore
    preprocessed: null,
    enabled: {
        Rendering: {
            enabled: false,
            LightingValue: "Allow Any",
            RendererValue: "Default"
        },
        Experimental: {
            enabled: false,
            value: []
        },
        Main: {
            enabled: false,
            Graphics: {
                value: "Disabled"
            },
            Privacy: {
                value: "Disabled"
            }
        }
    }
}

async function init() {
    // check the version
    console.log(chalk.bold.blue("Checking JCO commit."));
    await checkVersion();
    // find roblox
    console.log(chalk.bold.blue("Finding Roblox directories."));
    await rfo.findRoblox();
    // setup JCO files
    if (!fs.existsSync(`${root}\\data`)) fs.mkdirSync(`${root}\\data`);
    // preprocess flags
    console.log(chalk.bold.blue("Preprocessing flags."))
    await rfo.preprocessFlags();
    data.preprocessed = rfo.processedFlagList;
    // setup isHidden file for C++ frontend
    if (!fs.existsSync(`${root}\\data\\isHidden.jco`)) fs.writeFileSync(`${root}\\data\\isHidden.jco`, 'f')
    // setup json
    if (!fs.existsSync(`${root}\\data\\enabled.json`))  {
        console.log(chalk.bold.blue("Setting up enabled.json."));
        fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled));
    }
    else {
        console.log(chalk.bold.blue("Reading saved settings."))
        const enabled = JSON.parse(fs.readFileSync(`${root}\\data\\enabled.json`, 'utf8'));
        data.enabled = enabled;
        if (data.enabled.Main == undefined) data.enabled.Main = {
            enabled: false,
            Graphics: {
                value: "Disabled"
            },
            Privacy: {
                value: "Disabled"
            }
        }
        else data.preprocessed[0].Main.enabled = data.enabled.Main.enabled;
        if ("Privacy" in data.enabled) {
            /** @ts-ignore */
            data.enabled.Main.Privacy.value = data.enabled.Privacy.value;
            /** @ts-ignore */
            delete data.enabled.Privacy;
        }
        data.preprocessed[0].Main.features[0].value = data.enabled.Main.Privacy.value;
        data.preprocessed[0].Main.features[1].value = enabled.Main.Graphics.value;
        data.preprocessed[0].Rendering.enabled = enabled.Rendering.enabled;
        data.preprocessed[0].Rendering.features[1].value = enabled.Rendering.RendererValue;
        data.preprocessed[0].Rendering.features[0].value = enabled.Rendering.LightingValue;
        data.preprocessed[0].Experimental.enabled = enabled.Experimental.enabled;
        data.preprocessed[0].Experimental.features[0].value = enabled.Experimental.value;
    }
    console.log(chalk.bold.green("Successfully setup JCO. To hide this terminal window, click JCO's tray icon in the system tray (bottom right)."))
    ask();
}

const questions = {
    "Change Renderer": {
        execute: async () => {
            const awnser = await prompt({
                name: "renderer",
                type: 'list',
                loop: false,
                interruptedKeyName: 'b',
                message: `Which renderer would you like to use? Currently using ${data.enabled.Rendering.RendererValue}.`,
                choices: Object.keys(data.preprocessed[0].Rendering.features[1].options)
            });
            if (awnser) {
                // @ts-ignore
                data.preprocessed[0].Rendering.features[1].value = awnser;
                // @ts-ignore
                data.enabled.Rendering.RendererValue = awnser;
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4))
            }
            ask();
        }
    },
    "Change Lighting Engine": {
        execute: async () => {
            const awnser = await prompt({
                name: "lighting",
                type: 'list',
                loop: false,
                interruptedKeyName: 'b',
                message: `Which lighting engine would you like to use? Currently using ${data.enabled.Rendering.LightingValue}.`,
                choices: Object.keys(data.preprocessed[0].Rendering.features[0].options)
            });
            if (awnser) {
                // @ts-ignore
                data.preprocessed[0].Rendering.features[0].value = awnser;
                // @ts-ignore
                data.enabled.Rendering.LightingValue = awnser;
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4))
            }
            ask();
        }
    },
    "Change Privacy Settings": {
        execute: async () => {
            const awnser = await prompt({
                name: "privacy",
                type: 'list',
                loop: false,
                interruptedKeyName: 'b',
                message: `Which privacy setting would you like to use? Currently using ${data.enabled.Main.Privacy.value}.`,
                choices: Object.keys(data.preprocessed[0].Main.features[0].options)
            });
            if (awnser) {
                // @ts-ignore
                data.preprocessed[0].Main.features[0].value = awnser;
                // @ts-ignore
                data.enabled.Main.Privacy.value = awnser;
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4))
            }
            ask();
        }
    },
    "Change Graphics Quality Fix": {
        execute: async () => {
            const awnser = await prompt({
                name: "gqf",
                type: 'list',
                loop: false,
                interruptedKeyName: 'b',
                message: `Which graphics setting would you like to use? Currently using ${data.enabled.Main.Graphics.value}.`,
                choices: Object.keys(data.preprocessed[0].Main.features[1].options)
            });
            if (awnser) {
                // @ts-ignore
                data.preprocessed[0].Main.features[1].value = awnser;
                // @ts-ignore
                data.enabled.Main.Graphics.value = awnser;
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4))
            }
            ask();
        }
    },
    "Change Experimental Flags": {
        execute: async () => {
            const awnser = await prompt({
                name: "experimental",
                type: 'checkbox',
                loop: false,
                interruptedKeyName: 'b',
                message: `Which experimental flags would you like to use? Currently using ${data.enabled.Experimental.value.join(" and ")}.`,
                choices: Object.keys(data.preprocessed[0].Experimental.features[0].options)
            });
            if (awnser) {
                // @ts-ignore
                data.preprocessed[0].Experimental.features[0].value = awnser;
                // @ts-ignore
                data.enabled.Experimental.value = awnser;
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4))
            }
            ask();
        }
    },
    "Enable Flags": {
        execute: async () => {
            const awnser = await prompt({
                name: "flags",
                type: 'checkbox',
                loop: false,
                interruptedKeyName: 'b',
                message: "Which flags would you like to enable?",
                choices: Object.keys(data.preprocessed[0]).filter((v) => data.enabled[v].enabled == false)
            });
            if (awnser) {
                // @ts-ignore
                for (const item of awnser) {
                    data.preprocessed[0][item].enabled = true;
                    data.enabled[item].enabled = true;
                }
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4))
            }
            ask();
        }
    },
    "Disable Flags": {
        execute: async () => {
            const awnser = await prompt({
                name: "flags",
                type: 'checkbox',
                loop: false,
                interruptedKeyName: 'b',
                message: "Which flags would you like to disable?",
                choices: Object.keys(data.preprocessed[0]).filter((v) => data.enabled[v].enabled == true)
            });
            if (awnser) {
                // @ts-ignore
                for (const item of awnser) {
                    data.preprocessed[0][item].enabled = false;
                    data.enabled[item].enabled = false;
                }
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4));
            }
            ask();
        }
    },
    "Check for Update": {
        execute: async () => {
            const commit = (await ((await fetch("https://api.github.com/repos/tairasoul/JCO/commits?per_page=1")).json()))[0].sha;
            const ccommit = fs.readFileSync(`${root}/data/commit.jco`, 'utf8');
            if (ccommit != commit) {
                // inform user
                console.log(chalk.bold.red("Found a newer update for JCO, updating in 5 seconds."))
                // update and exit after 2 seconds
                return new Promise<void>((resolve) => {
                    setTimeout(() => {
                        console.log(chalk.bold.red("Updating JCO to github commit " + commit))
                        childproc.exec("C:/JCO/Installer/run.bat", () => {});
                        resolve();
                        exit(0);
                    }, 5000)
                })
            }
            else {
                console.log(chalk.bold.green("No updates found. You are on the latest version."));
            }
        }
    }
}

async function ask() {
    const awnser = await prompt({
        name: "option",
        type: 'list',
        loop: false,
        message: "What would you like to do?",
        choices: Object.keys(questions)
    });
    /** @ts-ignore */
    await questions[awnser].execute()
}

setInterval(async () => {
    // find roblox each time just incase it updates while JCO is active
    await rfo.findRoblox();
    rfo.applyFlags();
}, 20000);

init();
