import { RFO } from 'rfo.js/dist/RFO.js'
import inquirer from 'inquirer';
import fs from 'fs-extra';
import childproc from 'child_process'
import { exit } from 'process';
import chalk from 'chalk'
import * as defs from './definitions/index.js';
import interrupt from 'inquirer-interrupted-prompt';
import { Searcher } from './lib/searcher.js'
import { default as axios } from 'axios';
interrupt.fromAll(inquirer);

const root = "C:\\JCO\\Main";
const upd = "C:\\JCO\\Updater"
const JCOversion = "1.0.2";

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
    try {
        // get version
        const version = (await axios.get("https://raw.githubusercontent.com/fheahdythdr/JCO/main/version.jco")).data.trim();
        if (version != JCOversion) {
            // inform user
            console.log(chalk.bold.red("Updating JCO to version " + version))
            // update and exit after 2 seconds
            setTimeout(() => {
                const main = childproc.spawn('node', [`${upd}\\prerun.mjs`]);
                main.on('exit', () => {
                    childproc.spawn('node', [`${upd}\\main.mjs`]);
                    exit(0)
                })
            }, 2000)
        }
    } catch {
        console.log(chalk.bold.red("Could not get JCO version. JCO will continue anyways."))
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
        Privacy: {
            enabled: false,
            value: "Disabled"
        },
        Experimental: {
            enabled: false,
            value: []
        }
    },
    setup: false
}

async function init() {
    // check the version
    console.log(chalk.bold.blue("Checking JCO version."));
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
    if (!fs.existsSync(`${root}\\data\\enabled.json`)) 
        fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify({
            Rendering: {
                enabled: false,
                LightingValue: "Allow Any",
                RendererValue: "Default"
            },
            Privacy: {
                enabled: false,
                value: "Disabled"
            },
            Experimental: {
                enabled: false,
                value: []
            }
        }))
    else {
        const enabled = JSON.parse(fs.readFileSync(`${root}\\data\\enabled.json`, 'utf8'));
        data.enabled = enabled;
        data.preprocessed[0].Main.enabled = enabled.Privacy.enabled;
        data.preprocessed[0].Main.features[0].value = enabled.Privacy.value;
        data.preprocessed[0].Rendering.enabled = enabled.Rendering.enabled;
        data.preprocessed[0].Rendering.features[1].value = enabled.Rendering.RendererValue;
        data.preprocessed[0].Rendering.features[0].value = enabled.Rendering.LightingValue;
        data.preprocessed[0].Experimental.enabled = enabled.Experimental.enabled;
        data.preprocessed[0].Experimental.features[0].value = enabled.Experimental.value;
    }
    console.log(chalk.bold.green("Successfully setup JCO. To hide this terminal window, click JCO's tray icon in the system tray (bottom right)."))
    // completed setup
    data.setup = true
}

const questions = {
    "Change Renderer": {
        execute: async () => {
            const awnser = await prompt({
                name: "renderer",
                type: 'list',
                loop: false,
                interruptedKeyName: 'b',
                message: "Which renderer would you like to use?",
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
                message: "Which lighting engine would you like to use?",
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
                message: "Which privacy setting would you like to use?",
                choices: Object.keys(data.preprocessed[0].Main.features[0].options)
            });
            if (awnser) {
                // @ts-ignore
                data.preprocessed[0].Main.features[0].value = awnser;
                // @ts-ignore
                data.enabled.Privacy.value = awnser;
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
                message: "Which experimental flags would you like to use?",
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
        execute: async (options) => {
            const awnser = await prompt({
                name: "flags",
                type: 'checkbox',
                loop: false,
                interruptedKeyName: 'b',
                message: "Which flags would you like to enable?",
                choices: options
            });
            if (awnser) {
                // @ts-ignore
                for (const item of awnser) {
                    if (item == "Privacy") {
                        data.preprocessed[0].Main.enabled = true;
                        data.enabled.Privacy.enabled = true;
                    }
                    else {
                        data.preprocessed[0][item].enabled = true;
                        data.enabled[item].enabled = true;
                    }
                }
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4))
            }
            ask();
        }
    },
    "Disable Flags": {
        execute: async (options) => {
            const awnser = await prompt({
                name: "flags",
                type: 'checkbox',
                loop: false,
                interruptedKeyName: 'b',
                message: "Which flags would you like to disable?",
                choices: options
            });
            if (awnser) {
                // @ts-ignore
                for (const item of awnser) {
                    if (item == "Privacy") {
                        data.preprocessed[0].Main.enabled = false;
                        data.enabled.Privacy.enabled = false;
                    }
                    else {
                        data.preprocessed[0][item].enabled = false;
                        data.enabled[item].enabled = false;
                    }
                }
                fs.writeFileSync(`${root}\\data\\enabled.json`, JSON.stringify(data.enabled, null, 4));
            }
            ask();
        }
    }
}

async function ask() {
    if (!data.setup) await init();
    const awnser = await prompt({
        name: "option",
        type: 'list',
        loop: false,
        message: "What would you like to do?",
        choices: Object.keys(questions)
    });
    if (awnser == "Enable Flags")
        // @ts-ignore
        await questions[awnser].execute(Object.keys(data.enabled).filter((v) => data.enabled[v].enabled == false))
    else if (awnser == "Disable Flags")
        // @ts-ignore
        await questions[awnser].execute(Object.keys(data.enabled).filter((v) => data.enabled[v].enabled == true))
    else
        // @ts-ignore
        await questions[awnser].execute()
}

setInterval(async () => {
    // find roblox each time just incase it updates while JCO is active
    await rfo.findRoblox();
    rfo.applyFlags();
}, 20000)

ask();
