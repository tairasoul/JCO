const fs = require('fs')
const packagejson = require('rfo.js/package.json');

packagejson.type = "module";

fs.writeFileSync(__dirname + "/node_modules/rfo.js/package.json", JSON.stringify(packagejson, null, 4));

const rfo = fs.readFileSync(__dirname + "/node_modules/rfo.js/dist/RFO.js", 'utf8');

const lines = rfo.split("\n");

lines[6] = `
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
`

const res = lines.join('\n');

fs.writeFileSync(__dirname + "/node_modules/rfo.js/dist/RFO.js", res)
