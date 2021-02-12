import {tagTransactions} from "./internal/transaction/tags";
import {dedupe} from "./internal/transaction/dedupe";
import {filter, sort, sum} from "./internal/transaction/query";
import {printTransaction} from "./internal/transaction/transaction";
import {slurp} from "./internal/slurp";

// TODO query with OR/NOT/AND logic.
// TODO cli.
// TODO store converted format in file.

const transactions = dedupe(
    tagTransactions("matchers.json", slurp("transactions")),
);

if (false) {
    const tag = "food";
    sort(filter(transactions, [tag])).map((t) =>
        console.log(printTransaction(t)),
    );
    console.log("====");
    console.log(tag, sum(filter(transactions, [tag])).toLocaleString());
}
