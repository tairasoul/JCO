import { exec } from 'child_process'

const run = async (cmd) => {
    const child = exec(cmd, (err) => {
        if (err) console.error(err);
    });
    child.stderr.pipe(process.stderr);
    child.stdout.pipe(process.stdout);
    await new Promise((resolve) => child.on('close', resolve));
};

await run("npm i axios")
await run("npm i -g tsc");
