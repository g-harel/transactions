import {hideBin} from "yargs/helpers";
import yargs from "yargs/yargs";
import {fNumber, fTransactionLine} from "./format";
import {logInfo} from "./log";
import {tagTransactions} from "./match";
import {filter, sum, sort, tagTree} from "./query";
import {slurp} from "./slurp";
import {dedupe} from "./uniq";

// TODO query with OR/NOT/AND logic.
// TODO store converted format in file.
// TODO add commands to cli

const argv = yargs(hideBin(process.argv))
    .showHelpOnFail(true)
    .demandCommand()
    .recommendCommands()
    .strict()
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
        "total",
        "Calculate transactions total by tag",
        (yargs) => {
            yargs.option("tag", {
                alias: "t",
                type: "string",
                description: "Tag to query",
                demandOption: true,
            });
        },
        (argv) => {
            const transactions = sort(
                filter(
                    dedupe(tagTransactions(argv.matchfile, slurp(argv.dir))),
                    [(argv as any).tag],
                ),
            );

            logInfo(
                "transactions",
                transactions.map(fTransactionLine).join("\n"),
            );
            logInfo("total", fNumber(sum(transactions)));
        },
    ).argv;

export const verbose = argv.verbose;
