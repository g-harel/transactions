import {readMintArchive} from "./internal/ingest/mint";
import {tagTransactions} from "./internal/tags";
import {filter, print, sum, untagged, Transaction} from "./internal/transaction";

// TODO
// Deduplicate transactions in close time range and same absolute amount.
// Allow multiple tags per pattern.
// Merge transactions from multiple sources (by similarity?).

const transactions = tagTransactions("tags.txt", readMintArchive(".transactions.csv"));

console.log(sum(filter(transactions, ["food"])));

untagged(transactions).forEach(print);

const spending = readMintArchive(".transactions.csv")
    .filter((t) => t.amount < 0)
    // Vanguard transfers are investments.
    .filter((t) => !t.description.startsWith('"VANGUARD'))
    // Rent and (reimbursed) apartment expenses.
    .filter((t) => !t.description.match(/Wanchen/g))
    .filter((t) => !t.description.match(/Jin\'s/g))
    // In 2020.
    .filter((t) => t.date >= new Date("2010-01-01"))
    .filter((t) => t.date < new Date("2029-01-01"));

const totalSpending = spending.reduce((total, t) => total + t.amount, 0);

console.log(Math.abs(totalSpending).toLocaleString());
