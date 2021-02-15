import {tagTransactions} from "./internal/match";
import {dedupe} from "./internal/uniq";
import {filter, sort, sum} from "./internal/query";
import {printTransaction} from "./internal/transaction";
import {slurp} from "./internal/slurp";
import {argv} from "./internal/cli";

// TODO query with OR/NOT/AND logic.
// TODO store converted format in file.

const transactions = dedupe(tagTransactions(argv.matchfile, slurp(argv.dir)));

if (false) {
    const tag = "food";
    sort(filter(transactions, [tag])).map((t) =>
        console.log(printTransaction(t)),
    );
    console.log("====");
    console.log(tag, sum(filter(transactions, [tag])).toLocaleString());
}
