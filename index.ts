import {readMintArchive} from "./internal/ingest/mint";
import {tagTransactions} from "./internal/transaction/tags";
import {dedupe} from "./internal/transaction/dedupe";
import {filter, sort, sum} from "./internal/transaction/query";
import {print} from "./internal/transaction/transaction";

// TODO
// Deduplicate transactions in close time range and same absolute amount. (paypal)
// Merge transactions from multiple sources (by similarity?).
// Filter with OR/NOT/AND logic.

const transactions = tagTransactions(
    "tags.txt",
    dedupe(readMintArchive(".transactions.csv")),
);

if (false) {
    const tag = "food";
    sort(filter(transactions, [tag])).map((t) => console.log(print(t)));
    console.log("====");
    console.log(tag, sum(filter(transactions, [tag])).toLocaleString());
}
