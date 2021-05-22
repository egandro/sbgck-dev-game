import { State, StateMachine, Context } from './lib/statemachine';

class Solid extends State {
    name = 'Solid';
    transitions = [
        {
            transition: "melt",
            to: "Liquid"
        }
    ];

    async on(ctx: Context): Promise<void> {
        if (ctx.from == 'liquid') {
            console.log(' ... good bye');
        } else {
            await this.transitionTo('melt');
        }
    }
}

class Liquid extends State {
    name = 'Liquid';
    transitions = [
        {
            transition: "freeze",
            to: "Solid"
        },
        {
            transition: "vaporize",
            to: "Gas"
        }
    ];

    async on(ctx: Context): Promise<void> {
        if (ctx.from == 'solid') {
            await this.transitionTo('vaporize');
        } else {
            await this.transitionTo('freeze');
        }

    }
}

class Gas extends State {
    name = 'Gas';
    transitions = [
        {
            transition: "condense",
            to: "Liquid"
        }
    ];

    async on(ctx: Context): Promise<void> {
        await this.transitionTo('condense');
    }
}

const states: State[] = [
    new Solid(), new Liquid(), new Gas()
];

const sm = new StateMachine(states);
sm.verbose = true;

async function run() {
    await sm.run('solid')
}

run();
