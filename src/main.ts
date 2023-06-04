import * as src from './all/all';
import inquirer from 'inquirer';
import interrupt from 'inquirer-interrupted-prompt';
interrupt.fromAll(inquirer);
import { dialog } from '@fheahdythdr/node-file-dialog';
import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));

const Settings = new src.current(path.join(__dirname, "../", "current", "settings.json"));
const Mover = new src.mover(path.join(__dirname, "../", "current", "ClientSettings.json"));