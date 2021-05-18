import { t } from 'ttag';

import { StateMachine, Context } from './statemachine';
import { GameState, narrator } from './gamestate';

const GlobalData: any = {}

declare let x: string;
console.log(x);

class StartScreen extends GameState {
    name = 'StartScreen';
    transitions = [
        {
            transition: 'gotoCalibrateReferenceFrame',
            to: 'CalibrateReferenceFrame'
        }
    ];

    on(ctx: Context): void {
        this.bgMusic('main_theme.mp3');
        this.text(t`${narrator}Welcome to the debug game. This game is for one player.`);
        this.delay(2000);
        this.text(t`${narrator}Please make sure the camera is working, please check the zoom level and make sure it can see the playfield.`);
        this.delay(2000);
        this.transitionTo('gotoCalibrateReferenceFrame');
    }
}

class CalibrateReferenceFrame extends GameState {
    name = 'CalibrateReferenceFrame';
    transitions = [
        {
            transition: 'gotoCalibrateColors',
            to: 'CalibrateColors'
        }
    ];

    on(ctx: Context): void {
        let first = true;
        this.text(t`${narrator}We have to prepare a few things.`);
        while (true) {
            this.text(t`${narrator}Please remove all material from the playfield.`);
            if (first) {
                this.text(t`${narrator}Please wait until you hear this notification bell.`);
                this.sfx('bell.mp3');
                this.delay(2000);
                this.text(t`${narrator}Please empty the board.`);
                this.delay(2000);
                first = false;
            }
            if (this.calibrateReferenceFrame()) {
                this.sfx('bell.mp3');
                this.transitionTo('gotoCalibrateColors');
                break;
            }
            this.sfx('error.mp3');
            this.text(t`${narrator}We have issues detecting the playfield.`);
            this.delay(2000);
        }
    }
}

class CalibrateColors extends GameState {
    name = 'CalibrateColors';
    transitions = [
        {
            transition: 'gotoEndCalibrateColors',
            to: 'EndCalibrateColors'
        }
    ];

    on(ctx: Context): void {
        let first = true;
        while (true) {
            if (first) {
                this.text(t`${narrator}Please put now the color calibration card on the playfield.`);
                this.delay(2000);
                first = false;
            }
            if (this.detectColorCalibrationCard()) {
                this.transitionTo('gotoEndCalibrateColors');
                break;
            }
            this.sfx('error.mp3');
            this.text(t`${narrator}We have issues detecting the color calibration card.`);
            this.delay(2000);
        }
    }
}

class EndCalibrateColors extends GameState {
    name = 'EndCalibrateColors';
    transitions = [
        {
            transition: 'gotoExplainRules',
            to: 'ExplainRules'
        }
    ];

    on(ctx: Context): void {
        this.sfx('bell.mp3');
        while (true) {
            this.text(t`${narrator}Color calibration successful. Please remove the color calibration card.`);
            this.delay(2000);
            if (!this.detectColorCalibrationCard()) {
                this.sfx('bell.mp3');
                this.transitionTo('gotoExplainRules');
                break;
            }
            this.sfx('error.mp3');
            this.text(t`${narrator}Please remove the color calibration card.`);
            this.delay(2000);
        }
    }
}

class ExplainRules extends GameState {
    name = 'ExplainRules';
    transitions = [
        {
            transition: 'gotoDetectPlayers',
            to: 'DetectPlayers'
        }
    ];

    on(ctx: Context): void {
        this.stopBgMusic();
        this.text(t`${narrator}In this great exiting game you will be an elite soldier. Your mission is to sneak into the enemies control post.`);
        this.text(t`${narrator}You will start at a broken bridge.`);
        this.delay(2000);
        this.transitionTo('gotoDetectPlayers');
    }
}

class DetectPlayers extends GameState {
    name = 'DetectPlayers';
    transitions = [
        {
            transition: 'gotoGreetPlayers',
            to: 'GreetPlayers'
        }
    ];

    on(ctx: Context): void {
        let players: any;
        while (true) {
            this.text(t`${narrator}Please put your player token on the broken bridge.`);
            this.delay(2000);
            players = this.queryTokens(
                {
                    ROI: [
                        '#bridge'
                    ],
                    timeout: 5000,
                    tokens: [
                        'Blue Pentagon',
                        'Green Rectangle',
                        'Yellow Square',
                        'Purple Triangle'
                    ]
                }
            );
            if (players.length == 0) {
                this.sfx('error.mp3');
                this.text(t`${narrator}No Player detected`);
            } else {
                GlobalData['players'] = players;
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
            transition: 'gotoBridge',
            to: 'Bridge'
        }
    ];

    on(ctx: Context): void {
        for (const player of GlobalData['players']) {
            this.randomText('Greetings Soldier', 'Welcome Hero', 'Great to have you here');
            if (player == 'Blue Pentagon') {
                this.text(t`${narrator}blue soldier`);
            } else if (player == 'Green Rectangle') {
                this.text(t`${narrator}green soldier`);
            } else {
                this.text(t`${narrator}soldier`);
            }
            this.delay(2000);
        }
        this.text(t`${narrator}Being a soldier in the arctic base, requires an extraordinary constitution. You start with a stamina of three.`);
        this.delay(2000);
        this.text(t`${narrator}You also have a superior high-tech gear that includes a jetpack. Please keep in mind that the battery pack only gives you a single round.`);
        this.delay(2000);

        for (const player of GlobalData['players']) {
            if (player == 'Blue Pentagon') {
                this.text(t`${narrator}blue soldier`);
            } else if (player == 'Green Rectangle') {
                this.text(t`${narrator}green soldier`);
            } else {
                this.text(t`${narrator}soldier`);
            }
            this.delay(2000);
        }
        this.text(t`${narrator}Please get now a jetpack token and three stamina tokens.`);
        this.delay(5000);
        this.transitionTo('gotoBridge');
    }
}

class Bridge extends GameState {
    name = 'Bridge';
    transitions = [
        // {
        //     transition: 'gotoBridge',
        //     to: 'Bridge'
        // }
    ];

    on(ctx: Context): void {
        this.bgMusic('ice_and_wind.mp3');
        for (const player of GlobalData['players']) {
            if (player == 'Blue Pentagon') {
                this.text(t`${narrator}blue soldier`);
            } else if (player == 'Green Rectangle') {
                this.text(t`${narrator}green soldier`);
            } else {
                this.text(t`${narrator}soldier`);
            }
            this.delay(2000);
        }
        this.text(t`${narrator}You see a broken bridge. The water in the arctic base is cold.`);
        this.delay(2000);
        this.text(t`${narrator}You can try swimming in the ice water and spend one of your stamina tokens. You can also use your jetpack.`);
        this.delay(2000);
        this.text(t`${narrator}Make your decision and put a stamina token or the jetpack token on the playfield.`);
        this.delay(2000);
    }
}


const states: GameState[] = [
    new StartScreen(), new CalibrateReferenceFrame(), new CalibrateColors(), new EndCalibrateColors(),
    new ExplainRules(), new DetectPlayers(), new GreetPlayers(), new Bridge()
];

const sm = new StateMachine(states);
sm.verbose = true;
sm.run('StartScreen');
//GlobalData['players'] = ['Blue Pentagon'];
//sm.run('ExplainRules');
//sm.run('Bridge');
