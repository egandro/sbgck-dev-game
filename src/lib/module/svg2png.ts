import { SVGTools } from "../tools/svgtools.class";

const fs = require('fs');

export interface Opts {
    source: string;
    target: string;
    force: boolean;
}

export class SVG2PNG {
    opts: Opts = <any>null;

    async run(opts: Opts): Promise<number> {
        this.opts = opts;

        if(!SVGTools.createPNGsFromSVGs(this.opts.source, this.opts.target, this.opts.force)) {
            return 1;
        }

        return 0;
    }
}

export default function run(opts: any) {
    let instance = new SVG2PNG();
    return instance.run(opts);
}
