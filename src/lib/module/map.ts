import { MapTools } from "../tools/maptools.class";

const fs = require('fs');

export interface Opts {
    source: string;
    target: string;
    force: boolean;
}

export class Map {
    opts: Opts = <any>null;

    async run(opts: Opts): Promise<number> {
        this.opts = opts;

        if(!MapTools.createJsonFilesFromImageMaps(this.opts.source, this.opts.target, this.opts.force)) {
            return 1;
        }

        return 0;
    }
}

export default function run(opts: any) {
    let instance = new Map();
    return instance.run(opts);
}
