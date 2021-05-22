import { PoTools } from "../tools/potools.class";

const fs = require('fs');

export interface Opts {
    source: string;
    target: string;
    lang: string;
}

export class Po {
    opts: Opts = <any>null;

    async run(opts: Opts): Promise<number> {
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

        const langs = this.opts.lang.split(',');

        for (const i in langs) {
            const lang = langs[i].trim();

            if(!PoTools.createOrUpdatePoFile(this.opts.source, this.opts.target, lang)) {
                return 1;
            }

            if(!PoTools.createVoiceActorListFromPoFile(this.opts.target, lang)) {
                return 1;
            }
        }

        return 0;
    }
}

export default async function run(opts: any) {
    let instance = new Po();
    return instance.run(opts);
}
