import { State, StateMachine, Context } from './statemachine';

class Solid extends State {
    name = 'Solid';
    transitions = [
        {
            transition: "melt",
            to: "Liquid"
        }
    ];

    onEnter(ctx: Context): void {
        console.log('Entered: ', this.name);
        if (ctx.from == 'Liquid') {
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

    onEnter(ctx: Context): void {
        console.log('Entered: ', this.name);
        if (ctx.from == 'Solid') {
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

    onEnter(ctx: Context): void {
        console.log('Entered: ', this.name);
        this.transitionTo('condense');
    }
}

const states: State[] = [
    new Solid(), new Liquid(), new Gas()
];

const sm = new StateMachine(states);
sm.run('Solid');
