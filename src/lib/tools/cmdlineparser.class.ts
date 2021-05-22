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
                metavar: 'src',
                required: true,
                help: 'source directory of game files'
            })
            .option('target', {
                abbr: 't',
                metavar: 'build',
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
