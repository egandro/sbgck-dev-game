// cd src
//  ../node_modules/.bin/ts-node ./run.ts

declare var x: string;
globalThis.x = "abc";

// declare let x: string;
// if(x !== undefined) {
//     console.log(x);
// }

// Dynamic import
let xxx = './game.ts';


function foo(game: string) {
    import(game)
    .then((module:any)=> {
    });
}


foo(xxx);