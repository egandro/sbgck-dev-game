import { t } from 'ttag';

import { StateMachine, Context } from './lib/statemachine';
import { GameState } from './lib/sbgck';

export const narrator: string = '[narrator] '; // hack for t's

// supported html entities for https://ttsmp3.com/

class StartScreen extends GameState {
    name = 'StartScreen';
    transitions = [
        {
            transition: 'gotoCalibrateReferenceFrame',
            to: 'CalibrateReferenceFrame'
        }
    ];

    async on(ctx: Context): Promise<void> {
        await this.bgMusic('main_theme.mp3');
        await this.text(t`${narrator}<emphasis level="strong">     Welcome  </emphasis> to the debug game. This game is for one player.`);
        await this.delay(2000);
        await this.text(t`${narrator}Please make sure the camera is working, please check the zoom level and make sure it can see the playfield.`);
        await this.delay(2000);
        await this.transitionTo('gotoCalibrateReferenceFrame');
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

    async on(ctx: Context): Promise<void> {
        let first = true;
        await this.text(t`${narrator}We have to prepare a few things.`);
        while (true) {
            await this.text(t`${narrator}Please remove all material from the playfield.`);
            if (first) {
                await this.text(t`${narrator}Please wait until you hear this notification bell.`);
                await this.sfx('bell.mp3');
                await this.delay(2000);
                await this.text(t`${narrator}Please empty the board.`);
                await this.delay(2000);
                first = false;
            }
            if (this.calibrateReferenceFrame()) {
                await this.sfx('bell.mp3');
                await this.transitionTo('gotoCalibrateColors');
                break;
            }
            await this.sfx('error.mp3');
            await this.text(t`${narrator}We have issues detecting the playfield.`);
            await this.delay(2000);
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

    async on(ctx: Context): Promise<void> {
        let first = true;
        while (true) {
            if (first) {
                await this.text(t`${narrator}Please put now the color calibration card on the playfield.`);
                await this.delay(2000);
                first = false;
            }
            if (this.detectColorCalibrationCard()) {
                await this.transitionTo('gotoEndCalibrateColors');
                break;
            }
            await this.sfx('error.mp3');
            await this.text(t`${narrator}We have issues detecting the color calibration card.`);
            await this.delay(2000);
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

    async on(ctx: Context): Promise<void> {
        await this.sfx('bell.mp3');
        while (true) {
            await this.text(t`${narrator}Color calibration successful. Please remove the color calibration card.`);
            await this.delay(2000);
            if (!this.detectColorCalibrationCard()) {
                await this.sfx('bell.mp3');
                await this.transitionTo('gotoExplainRules');
                break;
            }
            await this.sfx('error.mp3');
            await this.text(t`${narrator}Please remove the color calibration card.`);
            await this.delay(2000);
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

    async on(ctx: Context): Promise<void> {
        await this.stopBgMusic();
        await this.text(t`${narrator}In this great exiting game you will be an elite soldier. Your mission is to sneak into the enemies control post.`);
        await this.text(t`${narrator}You will start at a broken bridge.`);
        await this.delay(2000);
        await this.transitionTo('gotoDetectPlayers');
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

    async on(ctx: Context): Promise<void> {
        let players: any;
        while (true) {
            await this.text(t`${narrator}Please put your player token on the broken bridge.`);
            await this.delay(2000);
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
                await this.sfx('error.mp3');
                await this.text(t`${narrator}No Player detected`);
            } else {
                this.sm.globalData['players'] = players;
                break;
            }
        }
        await this.transitionTo('gotoGreetPlayers');
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

    async on(ctx: Context): Promise<void> {
        for (const player of this.sm.globalData['players']) {
            await this.randomText(t`${narrator}Greetings Soldier`, t`${narrator}Welcome Hero`, t`${narrator}Great to have you here`);
            if (player == 'Blue Pentagon') {
                await this.text(t`${narrator}blue soldier`);
            } else if (player == 'Green Rectangle') {
                await this.text(t`${narrator}green soldier`);
            } else {
                await this.text(t`${narrator}soldier`);
            }
            await this.delay(2000);
        }
        await this.text(t`${narrator}Being a soldier in the arctic base, requires an extraordinary constitution. You start with a stamina of three.`);
        await this.delay(2000);
        await this.text(t`${narrator}You also have a superior high-tech gear that includes a jetpack. Please keep in mind that the battery pack only gives you a single round.`);
        await this.delay(2000);

        for (const player of this.sm.globalData['players']) {
            if (player == 'Blue Pentagon') {
                await this.text(t`${narrator}blue soldier`);
            } else if (player == 'Green Rectangle') {
                await this.text(t`${narrator}green soldier`);
            } else {
                await this.text(t`${narrator}soldier`);
            }
            await this.delay(2000);
        }
        await this.text(t`${narrator}Please get now a jetpack token and three stamina tokens.`);
        await this.delay(5000);
        await this.transitionTo('gotoBridge');
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

    async on(ctx: Context): Promise<void> {
        await this.bgMusic('ice_and_wind.mp3');
        for (const player of this.sm.globalData['players']) {
            if (player == 'Blue Pentagon') {
                await this.text(t`${narrator}blue soldier`);
            } else if (player == 'Green Rectangle') {
                await this.text(t`${narrator}green soldier`);
            } else {
                await this.text(t`${narrator}soldier`);
            }
            await this.delay(2000);
        }
        await this.text(t`${narrator}You see a broken bridge. The water in the arctic base is cold.`);
        await this.delay(2000);
        await this.text(t`${narrator}You can try swimming in the ice water and spend one of your stamina tokens. You can also use your jetpack.`);
        await this.delay(2000);
        await this.text(t`${narrator}Make your decision and put a stamina token or the jetpack token on the playfield.`);
        await this.delay(2000);
    }
}


const states: GameState[] = [
    new StartScreen(), new CalibrateReferenceFrame(), new CalibrateColors(), new EndCalibrateColors(),
    new ExplainRules(), new DetectPlayers(), new GreetPlayers(), new Bridge()
];

const sm = new StateMachine(states);
sm.verbose = true;

async function run() {
    await sm.run('StartScreen');
    // this.sm.globalData['players'] = ['Blue Pentagon'];
    // await sm.run('ExplainRules');
    // await sm.run('Bridge');

    await sm.run('solid')
}

run();
