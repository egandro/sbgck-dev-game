import { CmdLineParser, Action } from './tools/cmdlineparser.class';
const args: Action | null = CmdLineParser.parse();

if (args == null) {
    process.exit(0);
}

const run = require(args.module).default;
run(args.opts);