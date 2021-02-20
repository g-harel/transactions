import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";
import {tagTransactions} from "./match";
import {slurp} from "./slurp";
import {logInfo} from "./log";
import {tagTree} from "./query";

// TODO query with OR/NOT/AND logic.
// TODO store converted format in file.
// TODO add commands to cli

export const argv = yargs(hideBin(process.argv))
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
            console.log("gasdf");
            const transactions = tagTransactions(
                argv.matchfile,
                slurp(argv.dir),
            );
            logInfo("tags", tagTree(transactions));
        },
    ).argv;
