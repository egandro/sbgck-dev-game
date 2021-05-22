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
    sm: StateMachine;
    transitions: Transition[];
    on(ctx: Context): void;
    transitionTo(transitionToCall: string): void;
}

export abstract class State implements StateInterface {
    _transitionToCall: string = "";
    sm: StateMachine = <any>null;
    abstract name = "";
    abstract transitions: Transition[] = [];
    abstract on(ctx: Context): void;
    transitionTo(transitionToCall: string): void {
        this._transitionToCall = transitionToCall;
    }
}

function c(str: string) {
    // capitalizeFirstLetter
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export class StateMachine {
    verbose = false;
    fsm: any;
    globalData: Record<string, any> = {}

    constructor(public states: State[]) {

        const obj: any = {
            transitions: [],
            methods: {}
        };

        // .toLowerCase() is too stupid to fix the case issues...

        for (const state of states) {
            // store statemachine
            state.sm = this;
            // attach enter event
            obj.methods["on" + c(state.name.toLowerCase())] = (fsm: any) => {
                if (this.verbose) {
                    console.log('State:', state.name);
                }
                state.on(fsm);
            };
            // add transitions
            for (const trans of state.transitions) {
                obj.transitions.push({ name: trans.transition, from: state.name.toLowerCase(), to: trans.to.toLowerCase() });
            }
        }

        // special handling for goto
        obj.transitions.push({ name: 'goto', from: '*', to: (s: string) => { return s } });

        // create fsm
        this.fsm = new JavaScriptStateMachine(obj);
        // console.log(this.fsm.allStates());
        // console.log(this.fsm.allTransitions());
        // console.log(this.states);
        // console.log(this.fsm);
    }

    run(startState: string): void {
        startState = startState.toLowerCase();
        if (!this.fsm.allStates().includes(startState)) {
            console.error('invalid start state', startState);
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
                        //console.log("possible transitions:", this.fsm.transitions());
                        if (this.fsm.allTransitions().includes(trans)) {
                            found = true;
                            // console.log("xxx");
                            // console.log("state", this.fsm.state);
                            // console.log("xxx", this.fsm._fsm.config);

                            // console.log("trans:", trans);
                            // console.log("state:", this.fsm.state);
                            // console.log("map[state]:", this.fsm._fsm.config.map[this.fsm.state]);

                            if (this.fsm._fsm.config.map[this.fsm.state].hasOwnProperty(trans)) {
                                const transMap: any = this.fsm._fsm.config.map[this.fsm.state][trans];
                                if (transMap.from == transMap.to) {
                                    // console.log("Transitive state change detected!", transMap.from, '->', transMap.to);
                                    // hack with goto
                                    // console.log(this.fsm.transitions());
                                    // this.fsm.goto(transMap.from);
                                    // this.fsm._fsm.fire(transMap);
                                    // super hack here
                                    this.fsm._fsm.transit(trans, transMap.from + '_transitive', transMap.to, []);
                                    break;
                                }
                            }
                            this.fsm[trans]();
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


