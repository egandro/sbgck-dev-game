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

        if(!PoTools.createOrUpdatePoFiles(this.opts.source, this.opts.target, this.opts.lang)) {
            return 1;
        }

        return 0;
    }
}

export default async function run(opts: any) {
    let instance = new Po();
    return instance.run(opts);
}
