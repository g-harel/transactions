import {hideBin} from "yargs/helpers";
import yargs from "yargs/yargs";
import {fNumber, fTransactionLine} from "./format";
import {logInfo} from "./log";
import {tagTransactions} from "./match";
import {sum, tagTree} from "./query";
import {slurp} from "./slurp";
import {init, query, write} from "./sqlite";
import {dedupe} from "./uniq";

// TODO duplicate debug command

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
        type: "boolean",
        description: "Run with verbose logging.",
    })
    .option("dir", {
        type: "string",
        default: "transactions",
        description: "Specify transaction source.",
        demandOption: true,
    })
    .option("matchfile", {
        type: "string",
        default: "matchfile.json",
        description: "Specify matchfile.",
        demandOption: true,
    })
    .command(
        "inspect",
        "Inspect transactions.",
        (yargs) => {
            yargs.option("tags", {
                type: "boolean",
                description: "Print the calculated tag tree",
            });
        },
        (argv) => {
            const transactions = tagTransactions(
                argv.matchfile,
                slurp(argv.dir),
            );
            if ((argv as any).tags) {
                logInfo("tags", tagTree(transactions));
            }
            logInfo("No errors.");
        },
    )
    .command(
        "query [sql]",
        "Query transactions.",
        (yargs) => {
            yargs
                .positional("sql", {
                    describe: "SQL query.",
                    demandOption: true,
                })
                .option("total", {
                    type: "boolean",
                    description: "Print total of queried transactions.",
                });
        },
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
                logInfo("Query produced no transactions.");
            }
        },
    ).argv;
