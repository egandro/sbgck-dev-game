# Finite Statemachine Demo

## Usage

Check main.ts for code.

```
$ npm install
$ npm run startMain
```

Result

```
Entered:  Solid
Entered:  Liquid
Entered:  Gas
Entered:  Liquid
Entered:  Solid
 ... good bye

```

TTag: https://ttag.js.org/docs/typescript.html

Idea:

```
  $ echo -n '${ narrator }Please make sure the camera is working, please check the zoom level and make sure it can see the playfield.' | md5sum | sed 's/\s.*$//'
```

node launcher.js po -s ./src -t ./dist/po -l en,de,fr

node launcher.js tts -s ./dist/po -t ./dist/mp3 -m ./tts-map.json