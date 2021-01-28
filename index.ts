import {readMintArchive} from "./internal/ingest/mint";
import {tagTransactions} from "./internal/tags";
import {filter, sum} from "./internal/transaction";

// TODO
// Deduplicate transactions in close time range and same absolute amount.
// Merge transactions from multiple sources (by similarity?).
// Filter with OR/NOT/AND logic.

const transactions = tagTransactions(
    "tags.txt",
    readMintArchive(".transactions.csv"),
);

const sumTag = (tag: string) => {
    console.log(tag, sum(filter(transactions, [tag])).toLocaleString());
};

sumTag("income");
sumTag("spending");
sumTag("food");
sumTag("finances");
console.log("total", sum(transactions).toLocaleString());
