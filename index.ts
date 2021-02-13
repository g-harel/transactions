import {tagTransactions} from "./internal/transaction/tags";
import {dedupe} from "./internal/transaction/dedupe";
import {filter, sort, sum} from "./internal/transaction/query";
import {printTransaction} from "./internal/transaction/transaction";
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
