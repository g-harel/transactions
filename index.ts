import {readMintArchive} from "./internal/ingest/mint";
import {tagTransactions} from "./internal/tags";
import {filter, print, sum} from "./internal/transaction";

// TODO
// Deduplicate transactions in close time range and same absolute amount.
// Merge transactions from multiple sources (by similarity?).
// Filter with OR/NOT/AND logic.

const transactions = tagTransactions(
    "tags.txt",
    readMintArchive(".transactions.csv"),
);

const tag = "taxes";
filter(transactions, [tag]).map((t) => console.log(print(t)));
console.log("====");
console.log(tag, sum(filter(transactions, [tag])).toLocaleString());
