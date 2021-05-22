import { CmdLineParser, Action } from './tools/cmdlineparser.class';
const args: Action | null = CmdLineParser.parse();

if (args == null) {
    process.exit(0);
}

const run = require(args.module).default;
const opts = args.opts;

async function start() : Promise<void> {
    const result = await run(opts);
    process.exit(result);
}

start();
