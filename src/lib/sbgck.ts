import { msgid2mp3name, cleanHTMLEntities } from './poutils';
import { State } from './statemachine';

export abstract class GameState extends State {
    public static verboseText: boolean = true;
    async text(str: string): Promise<void> {
        const mp3 = msgid2mp3name(str, ']');
        str = cleanHTMLEntities(str);
        if (GameState.verboseText) {
            console.log('   mp3 audio:', mp3, str);
        } else {
            console.log('   mp3 audio:', str);
        }
    }
    async randomText(...args: string[]): Promise<void> {
        const i = Math.floor(Math.random() * args.length);
        await this.text(args[i]);
    }
    async bgMusic(str: string): Promise<void> {
        console.log('   looped background music:', str);
    }
    async sfx(str: string): Promise<void> {
        console.log('   sfx:', str);
    }
    async stopBgMusic(): Promise<void> {
        console.log('   background music stopped');
    }
    async delay(ms: number): Promise<void> {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    }

    hack1 = true;
    async calibrateReferenceFrame(): Promise<boolean> {
        if (this.hack1) {
            this.hack1 = false;
            return false;
        }
        return true;
    }

    hack2 = true;
    async detectColorCalibrationCard(): Promise<boolean> {
        if (this.hack2) {
            this.hack2 = false;
            return false;
        }
        // this.hack2 = false;
        return true;
    }

    hack3 = true;
    async queryTokens(param: any): Promise<any> {
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