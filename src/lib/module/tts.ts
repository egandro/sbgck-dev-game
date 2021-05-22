import { TTSTools } from "../tools/ttstools.class";

const fs = require('fs');

export interface Opts {
    source: string;
    target: string;
    force: boolean;
    map?: string;
}

export class TTS {
    opts: Opts = <any>null;

    async run(opts: Opts): Promise<number> {
        this.opts = opts;

        if(!await TTSTools.createMp3sFilesFromCVSs(this.opts.source, this.opts.target, this.opts.force, this.opts.map)) {
            return 1;
        }

        return 0;
    }
}

export default function run(opts: any) {
    let instance = new TTS();
    return instance.run(opts);
}
