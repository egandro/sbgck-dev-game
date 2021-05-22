import { TTSTools } from "../tools/ttstools.class";

const fs = require('fs');

export interface Opts {
    source: string;
    target: string;
    map: string;
}

export class TTS {
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

        if (!fs.existsSync(this.opts.map)) {
            console.error(`error: tts map file does not exist "${this.opts.map}"`);
            return 1;
        }

        const fileNames = fs.readdirSync(this.opts.source);
        const tail = "_tts.csv";

        for (const fileName of fileNames) {
            if (!fileName.endsWith(tail)) {
                continue;
            }
            if (fileName.length != tail.length + 2) {
                continue;
            }
            const lang = fileName.substr(0, 2);

            const csvFile = this.opts.source + "/" + fileName;

            if(!await TTSTools.createMp3FilesFromCVS(csvFile, this.opts.target, lang, this.opts.map)) {
                return 1;
            }
        }

        return 0;
    }
}

export default function run(opts: any) {
    let instance = new TTS();
    return instance.run(opts);
}
