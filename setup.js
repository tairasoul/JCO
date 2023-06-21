import { writeFileSync, readFileSync } from "fs";
import packagejson from "rfo.js/package.json";

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
