import {tagTransactions} from "./internal/match";
import {dedupe} from "./internal/uniq";
import {filter, sort, sum, tagTree} from "./internal/query";
import {printTransaction} from "./internal/transaction";
import {slurp} from "./internal/slurp";
import {argv} from "./internal/cli";
import {logInfo} from "./internal/log";

// TODO query with OR/NOT/AND logic.
// TODO store converted format in file.
// TODO add commands to cli

if (true) {
    const transactions = tagTransactions(argv.matchfile, slurp(argv.dir));
    logInfo("tags", tagTree(transactions));
}

if (false) {
    const transactions = dedupe(
        tagTransactions(argv.matchfile, slurp(argv.dir)),
    );
    const tag = "food";
    sort(filter(transactions, [tag])).map((t) =>
        logInfo(printTransaction(t).replace("\n", " ")),
    );
    logInfo(tag, sum(filter(transactions, [tag])).toLocaleString());
}
