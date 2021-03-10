import {hideBin} from "yargs/helpers";
import yargs from "yargs/yargs";
import {fNumber, fTransactionLine} from "./format";
import {logInfo} from "./log";
import {tagTransactions} from "./match";
import {sum, tagTree} from "./query";
import {slurp} from "./slurp";
import {init, query, write} from "./sqlite";
import {dedupe} from "./uniq";

// TODO query with OR/NOT/AND logic.
// TODO store converted format in file.
// TODO add commands to cli
// TODO duplicate debug command
// TODO admin command namespace

export const verboseFlag = () => !!(global as any).yargv.verbose;

yargs(hideBin(process.argv))
    .demandCommand()
    .recommendCommands()
    .strict()
    .middleware((argv) => {
        // Make flags available globally once they're known.
        (global as any).yargv = argv;
    })
    .option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Run with verbose logging",
    })
    .option("dir", {
        alias: "d",
        type: "string",
        description: "Specify transaction source",
        demandOption: true,
    })
    .option("matchfile", {
        alias: "m",
        type: "string",
        description: "Specify matchfile",
        demandOption: true,
    })
    .command(
        "tag-tree",
        "Print the calculated tag tree",
        () => {},
        (argv) => {
            const transactions = tagTransactions(
                argv.matchfile,
                slurp(argv.dir),
            );
            logInfo("tags", tagTree(transactions));
        },
    )
    .command(
        "read",
        "Read all transactions and exit",
        () => {},
        (argv) => {
            dedupe(tagTransactions(argv.matchfile, slurp(argv.dir)));
        },
    )
    .command(
        "query [sql]",
        "Query transactions",
        (yargs) => {
            yargs.positional("sql", {
                describe: "SQL query. Use TODO to inspect schema",
                demandOption: true,
            })
            .option("total", {
                type: "boolean",
                description: "Also print total of queried transactions.",
            });
        },
        // TODO print different when not transactions returned.
        async (argv) => {
            const transactions = dedupe(
                tagTransactions(argv.matchfile, slurp(argv.dir)),
            );
            await init();
            await write(transactions);

            const results = await query((argv as any).sql);
            if (results.length > 0) {
                logInfo(
                    "transactions",
                    results.map(fTransactionLine).join("\n"),
                );
                if ((argv as any).total) {
                    logInfo("total", fNumber(sum(results)));
                }
            } else {
                logInfo("Query produced no results.")
            }
        },
    ).argv;
