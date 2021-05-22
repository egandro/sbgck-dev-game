#!/usr/bin/env node

// workaround for multiuser environment
var cacheDirectory = process.env.TMP;
if (process.platform != 'win32') {
    // we only have to take care in non windows environment
    if (process.env.HOME != '') {
        cacheDirectory = process.env.HOME + '/.ts-node-cache';
    }
}

require('ts-node').register({
    ignore: [], // needed in order to run from /usr/local...
    cacheDirectory: cacheDirectory,
    cache: true,
    dir: __dirname
});

require('./src/lib/cli.ts');