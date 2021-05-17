import { State, StateMachine, Context } from './statemachine';


const GlobalData: any = {}

abstract class GameState extends State {
    text(str: string): void {
        console.log("   playing mp3 audio: ", str);
    }
    randomText(...args: string[]): void {
        const i = Math.floor(Math.random() * (args.length - 0) + 0);
        this.text(args[i]);
    }
    bgMusic(str: string): void {
        console.log("   playing looped background music: ", str);
    }
    sfx(str: string): void {
        console.log("   playing sound effect: ", str);
    }
    stopBgMusic(): void {
        console.log("   background music stopped ");
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
        return ["Blue Pentagon", "Green Rectangle"];
    }
}

class StartScreen extends GameState {
    name = 'StartScreen';
    transitions = [
        {
            transition: "gotoCalibrateReferenceFrame",
            to: "CalibrateReferenceFrame"
        }
    ];

    on(ctx: Context): void {
        this.bgMusic('main_theme.mp3');
        this.text('Welcome to the debug game. This game is for one player.');
        this.delay(2000);
        this.text('Please make sure the camera is working, please check the zoom level and make sure it can see the playfield.');
        this.delay(2000);
        this.transitionTo('gotoCalibrateReferenceFrame');
    }
}

class CalibrateReferenceFrame extends GameState {
    name = 'CalibrateReferenceFrame';
    transitions = [
        {
            transition: "gotoCalibrateColors",
            to: "CalibrateColors"
        }
    ];

    on(ctx: Context): void {
        let first = true;
        this.text('We have to prepare a few things.');
        while (true) {
            this.text('Please remove all material from the playfield.');
            if (first) {
                this.text('Please wait until you hear this notification bell.');
                this.sfx("bell.mp3");
                this.delay(2000);
                this.text('We are starting now.');
                this.delay(2000);
                first = false;
            }
            if (this.calibrateReferenceFrame()) {
                this.sfx("bell.mp3");
                this.transitionTo('gotoCalibrateColors');
                break;
            }
            this.sfx("error.mp3");
            this.text('We have issues detecting the playfield.');
            this.delay(2000);
        }
    }
}

class CalibrateColors extends GameState {
    name = 'CalibrateColors';
    transitions = [
        {
            transition: "gotoEndCalibrateColors",
            to: "EndCalibrateColors"
        }
    ];

    on(ctx: Context): void {
        let first = true;
        while (true) {
            if (first) {
                this.text('Please put now the color calibration card on the playfield.');
                this.delay(2000);
                first = false;
            }
            if (this.detectColorCalibrationCard()) {
                this.transitionTo('gotoEndCalibrateColors');
                break;
            }
            this.sfx("error.mp3");
            this.text('We have issues detecting the color calibration card.');
            this.delay(2000);
        }
    }
}

class EndCalibrateColors extends GameState {
    name = 'EndCalibrateColors';
    transitions = [
        {
            transition: "gotoExplainRules",
            to: "ExplainRules"
        }
    ];

    on(ctx: Context): void {
        let first = true;
        while (true) {
            if (first) {
                this.sfx("bell.mp3");
                this.text('Color calibration successful. Please remove the color calibration card.');
                this.delay(2000);
                first = false;
            }
            if (!this.detectColorCalibrationCard()) {
                this.sfx("bell.mp3");
                this.transitionTo('gotoExplainRules');
                break;
            }
            this.sfx("error.mp3");
            this.text('Please remove the color calibration card.');
            this.delay(2000);
        }
    }
}

class ExplainRules extends GameState {
    name = 'ExplainRules';
    transitions = [
        {
            transition: "gotoDetectPlayers",
            to: "DetectPlayers"
        }
    ];

    on(ctx: Context): void {
        this.text('In this great exiting game you will be an elite soldier. Your mission is to sneak into the enemies control post.');
        this.text('You will start at a broken bridge.');
        this.delay(2000);
        this.transitionTo('gotoDetectPlayers');
    }
}

class DetectPlayers extends GameState {
    name = 'DetectPlayers';
    transitions = [
        {
            transition: "gotoGreetPlayers",
            to: "GreetPlayers"
        }
    ];

    on(ctx: Context): void {
        this.text('Please put your player token on the broken bridge.');
        this.delay(2000);
        let players: any;
        while (true) {
            players = this.queryTokens(
                {
                    ROI: [
                        "#bridge"
                    ],
                    timeout: 5000,
                    tokens: [
                        "Blue Pentagon",
                        "Green Rectangle",
                        "Yellow Square",
                        "Purple Triangle"
                    ]
                }
            );
            if (players.length == 0) {
                this.sfx("error.mp3");
                this.text('No Player detected');
            } else {
                GlobalData["players"] = players;
                break;
            }
        }
        this.transitionTo('gotoGreetPlayers');
    }
}

class GreetPlayers extends GameState {
    name = 'GreetPlayers';
    transitions = [
        {
            transition: "gotoBridge",
            to: "Bridge"
        }
    ];

    on(ctx: Context): void {
        for (const player of GlobalData["players"]) {
            this.randomText("Greetings Soldier", "Welcome Hero", "Great to have you here");
            if (player == "Blue Pentagon") {
                this.text("blue soldier");
            } else if (player == "Green Rectangle") {
                this.text("green soldier");
            } else {
                this.text("soldier");
            }
            this.delay(2000);
        }
        this.text('Being a soldier in the arctic base, you have an extraordinary constitution. You start with a stamina of three.');
        this.delay(2000);
        this.text('You also have a superior armour that includes a jetpack. Please keep in mind that the battery pack only gives you a single round.');
        this.delay(2000);

        for (const player of GlobalData["players"]) {
            if (player == "Blue Pentagon") {
                this.text("blue soldier");
            } else if (player == "Green Rectangle") {
                this.text("green soldier");
            } else {
                this.text("soldier");
            }
            this.delay(2000);
        }
        this.text('Please get now a jetpack token and three stamina tokens.');
        this.delay(5000);
        this.transitionTo('gotoBridge');
    }
}

class Bridge extends GameState {
    name = 'Bridge';
    transitions = [
        {
            transition: "gotoBridge",
            to: "Bridge"
        }
    ];

    counter = 3;
    on(ctx: Context): void {
        // simulate a loop
        if (this.counter != 0) {
            this.counter--;
            this.transitionTo('gotoBridge');
        }
    }
}

const states: State[] = [
    new StartScreen(), new CalibrateReferenceFrame(), new CalibrateColors(), new EndCalibrateColors(),
    new ExplainRules(), new DetectPlayers(), new GreetPlayers(), new Bridge()
];

const sm = new StateMachine(states);
sm.verbose = true;
//sm.run('StartScreen');
GlobalData["players"] = ["Blue Pentagon", "Green Rectangle"];
sm.run('ExplainRules');
//sm.run('Bridge');
