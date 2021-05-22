import { GameTools } from "../tools/gametools.class";

const fs = require('fs');

export interface Opts {
    source: string;
    target: string;
    force: boolean;
}

export class Game {
    opts: Opts = <any>null;

    async run(opts: Opts): Promise<number> {
        this.opts = opts;

        if(!await GameTools.createGameFromDirectory(this.opts.source, this.opts.target, this.opts.force)) {
            return 1;
        }

        return 0;
    }
}

export default function run(opts: any) {
    let instance = new Game();
    return instance.run(opts);
}
