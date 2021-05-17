// https://github.com/jakesgordon/javascript-state-machine
// typescript: https://github.com/jakesgordon/javascript-state-machine/pull/188/files // typings do not work (too old)

const JavaScriptStateMachine = require('javascript-state-machine');

export interface Transition {
    transition: string;
    to: string;
}

export interface Context {
    transition: string;
    from: string;
    to: string;
    fsm: any;
}

export interface StateInterface {
    name: string;
    transitions: Transition[];
    onEnter(ctx: Context): void;
    transitionTo(transitionToCall: string): void;
}

export abstract class State implements StateInterface {
    _transitionToCall: string = "";
    abstract name = "";
    abstract transitions: Transition[] = [];
    abstract onEnter(ctx: Context): void;
    transitionTo(transitionToCall: string): void {
        this._transitionToCall = transitionToCall;
    }
}

function c(str: string) {
    // capitalizeFirstLetter
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export class StateMachine {
    fsm: any;
    constructor(public states: State[]) {

        const obj: any = {
            transitions: [],
            methods: {}
        };

        for (const state of states) {
            // attach enter event
            obj.methods["on" + c(state.name)] = (fsm: any) => {
                state.onEnter(fsm);
            };
            // add transitions
            for (const trans of state.transitions) {
                obj.transitions.push({ name: trans.transition, from: state.name, to: trans.to });
            }
        }

        // special handling for goto
        obj.transitions.push({ name: 'goto', from: '*', to: (s: string) => { return s } });

        // create fsm
        this.fsm = new JavaScriptStateMachine(obj);
    }

    run(startState: string) {
        if (!this.fsm.allStates().includes(startState)) {
            return;
        }

        this.fsm.goto(startState);

        while (true) {
            let found = false;
            for (const state of this.states) {
                let trans: string = state._transitionToCall;
                state._transitionToCall = "";
                if (trans != null || trans !== undefined) {
                    trans = trans.trim();
                    if (trans.length > 0) {
                        if (this.fsm.allTransitions().includes(trans)) {
                            this.fsm[trans]();
                            found = true;
                            break;
                        }
                    }
                }
            }
            if (!found) {
                break;
            }
        }
    }
}


