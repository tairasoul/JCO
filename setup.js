import { writeFileSync, readFileSync, existsSync } from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
const packagejson = JSON.parse(readFileSync(`${__dirname}/node_modules/rfo.js/package.json`))

if (existsSync(__dirname + "/node_modules/rfo.js/modified.txt")) process.exit(0);

packagejson.type = "module";

writeFileSync(__dirname + "/node_modules/rfo.js/package.json", JSON.stringify(packagejson, null, 4));

const rfo = readFileSync(__dirname + "/node_modules/rfo.js/dist/RFO.js", 'utf8');

const lines = rfo.split("\n");

lines[6] = `
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
`

const res = lines.join('\n');

writeFileSync(__dirname + "/node_modules/rfo.js/dist/RFO.js", res)

writeFileSync(__dirname + "/node_modules/rfo.js/modified.txt", "")
