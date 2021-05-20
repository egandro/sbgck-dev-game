const crypto = require('crypto');

import { State } from './statemachine';

function md5sum(val:string) : string {
    return crypto.createHash('md5').update(val).digest('hex');
}

export abstract class GameState extends State {
    text(str: string): void {
        console.log('   mp3 audio:', str);
        const pos = str.indexOf(']');
        if(pos>-1) {
            let text = str.substring(pos+1, str.length).trim();
            text = md5sum(text) + ".mp3";
            // console.log('             ', text);
        }
    }
    randomText(...args: string[]): void {
        const i = Math.floor(Math.random() * args.length);
        this.text(args[i]);
    }
    bgMusic(str: string): void {
        console.log('   looped background music:', str);
    }
    sfx(str: string): void {
        console.log('   sfx:', str);
    }
    stopBgMusic(): void {
        console.log('   background music stopped');
    }
    delay(ms: number): void {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    }

    hack1 = true;
    calibrateReferenceFrame(): boolean {
        if (this.hack1) {
            this.hack1 = false;
            return false;
        }
        return true;
    }

    hack2 = true;
    detectColorCalibrationCard(): boolean {
        if (this.hack2) {
            this.hack2 = false;
            return false;
        }
        // this.hack2 = false;
        return true;
    }

    hack3 = true;
    queryTokens(param: any): any {
        if (param.timeout) {
            this.delay(param.timeout);
        }

        if (this.hack3) {
            this.hack3 = false;
            return [];
        }
        this.hack3 = true;
        return ['Blue Pentagon'];
    }
}