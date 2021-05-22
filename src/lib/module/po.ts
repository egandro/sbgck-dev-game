const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
export interface Opts {
    source: string;
    target: string;
    lang: string;
}

export class Po {
    opts: Opts = <any>null;

    run(opts: Opts): number {
        this.opts = opts;

        if (!fs.existsSync(this.opts.source)) {
            console.error(`error: source directory does not exist "${this.opts.source}"`);
            return 1;
        }

        if (!fs.existsSync(this.opts.target)) {
            fs.mkdirSync(this.opts.target, { recursive: true });
        }

        if (!fs.existsSync(this.opts.target)) {
            console.error(`error: target directory does not exist "${this.opts.target}"`);
            return 1;
        }

        // get the bin path of npm by calling "npm bin"
        const npmBinPath = execSync("npm bin").toString().trim();
        const ttagCmd = npmBinPath + "/" + "ttag";

        const langs = this.opts.lang.split(',');

        for (const i in langs) {
            // make pretty
            const lang = langs[i].trim();

            const poFile = this.opts.target + "/" + lang + ".po";

            // init
            if (!fs.existsSync(poFile)) {
                let cmd = ttagCmd + ` init ${lang} ${poFile}`;
                execSync(cmd);
            } else {
                // console.log(`${poFile} exists - init skip`);
            }

            // update
            let cmd = ttagCmd + ` update ${poFile} ${this.opts.source}`;
            execSync(cmd);
        }

        return 0;
    }

}

export default function run(opts: any) {
    let instance = new Po();
    return instance.run(opts);
}
