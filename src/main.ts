import { State, StateMachine, Context } from './lib/statemachine';

class Solid extends State {
    name = 'Solid';
    transitions = [
        {
            transition: "melt",
            to: "Liquid"
        }
    ];

    on(ctx: Context): void {
        if (ctx.from == 'liquid') {
            console.log(' ... good bye');
        } else {
            this.transitionTo('melt');
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

    on(ctx: Context): void {
        if (ctx.from == 'solid') {
            this.transitionTo('vaporize');
        } else {
            this.transitionTo('freeze');
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

    on(ctx: Context): void {
        this.transitionTo('condense');
    }
}

const states: State[] = [
    new Solid(), new Liquid(), new Gas()
];

const sm = new StateMachine(states);
sm.verbose = true;
sm.run('Solid');
