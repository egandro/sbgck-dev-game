var parser = require("@gerhobbelt/nomnom")


export interface Action {
    module: string,
    opts: any
};

export class CmdLineParser {
    public static parse(): Action | null {
        parser.command('po')
            .option('source', {
                abbr: 's',
                metavar: 'source',
                required: true,
                help: 'source directory of game files'
            })
            .option('target', {
                abbr: 't',
                metavar: 'target',
                required: true,
                help: 'output directory of po files'
            })
            .option('lang', {
                abbr: 'l',
                metavar: 'en,de,uk',
                required: true,
                help: 'comma separated names of the languages for the po file - first is the default [required] ' +
                      '(check about available languages here - https://www.gnu.org/software/gettext/manual/html_node/Usual-Language-Codes.html)'
            })
            .help('creates po for a directory with typescript files');

        parser.command('tts')
            .option('source', {
                abbr: 's',
                metavar: 'src',
                required: true,
                help: 'source directory of *_tts.csv files'
            })
            .option('target', {
                abbr: 't',
                metavar: 'target',
                required: true,
                help: 'output directory of mp3 files'
            })
            .option('force', {
                abbr: 'f',
                default: false,
                flag: true,
                help: 'force overwrite'
            })
            .option('map', {
                abbr: 'm',
                help: 'use custom json file with mapping for tts, role, roles'
            })
            .help('creates mp3 files with a free tts engine from *_tts.csv files create by the "po" command');

        parser.command('map')
            .option('source', {
                abbr: 's',
                metavar: 'src',
                required: true,
                help: 'source directory of *.map files'
            })
            .option('target', {
                abbr: 't',
                metavar: 'target',
                required: true,
                help: 'output directory of json version of map files'
            })
            .option('force', {
                abbr: 'f',
                default: false,
                flag: true,
                help: 'force overwrite'
            })
            .help('creates json files from html image map .map files');

        parser.command('svg2png')
            .option('source', {
                abbr: 's',
                metavar: 'src',
                required: true,
                help: 'source directory of *.svg files'
            })
            .option('target', {
                abbr: 't',
                metavar: 'target',
                required: true,
                help: 'output directory of png version of svg files'
            })
            .option('force', {
                abbr: 'f',
                default: false,
                flag: true,
                help: 'force overwrite'
            })
            .help('creates png files svg files (by using imagemagick)');

        parser.command('game')
            .option('source', {
                abbr: 's',
                metavar: 'src',
                required: true,
                default: ".",
                help: 'default project directory'
            })
            .option('target', {
                abbr: 't',
                metavar: 'target',
                required: true,
                default: "./game",
                help: 'output directory '
            })
            .option('force', {
                abbr: 'f',
                default: false,
                flag: true,
                help: 'force overwrite'
            })
            .help('creates game from given source dir');

        let opts = parser.parse();

        if (opts[0] === undefined || opts[0] === '') {
            return null;
        }

        const action: Action = {
            module: '../lib/module/' + opts[0],
            opts: opts
        };

        return action;
    }
}
