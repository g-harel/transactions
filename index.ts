import {tagTransactions} from "./internal/transaction/tags";
import {dedupe} from "./internal/transaction/dedupe";
import {filter, sort, sum} from "./internal/transaction/query";
import {printTransaction} from "./internal/transaction/transaction";
import {slurp} from "./internal/slurp";

// TODO
// Deduplicate transactions in close time range and same absolute amount. (paypal)
// Merge transactions from multiple sources (by similarity?).
// Filter with OR/NOT/AND logic.
// Toggleable verbose logs for ignored stuff and errors.

const transactions = tagTransactions(
    "matchers.json",
    dedupe(slurp("transactions")),
);

if (false) {
    const tag = "food";
    sort(filter(transactions, [tag])).map((t) =>
        console.log(printTransaction(t)),
    );
    console.log("====");
    console.log(tag, sum(filter(transactions, [tag])).toLocaleString());
}
