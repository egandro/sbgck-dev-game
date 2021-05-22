import { MapTools } from "../tools/maptools.class";

const fs = require('fs');

export interface Opts {
    source: string;
    target: string;
}

export class Map {
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

        const fileNames = fs.readdirSync(this.opts.source);
        const tail = ".map";

        for (let fileName of fileNames) {
            if (!fileName.endsWith(tail)) {
                continue;
            }

            fileName = this.opts.source + "/" + fileName;

            if(!MapTools.createJsonFilesFromMap(fileName, this.opts.target)) {
                return 1;
            }
        }

        return 0;
    }
}

export default function run(opts: any) {
    let instance = new Map();
    return instance.run(opts);
}
