import * as fs from "fs";
import {categories} from "./categories";

interface Transaction {
    date: Date;
    description: string;
    amount: number;
    tags: string[];
}

// TODO
// Convert categories regex description matching and make more generic.
// Make category matches label data instead of splitting it up.
// Deduplicate transactions in close time range and same amount.

// Type check.
const $categories: {[_: string]: string[]} = categories;

const readCSV = (fileName: string): string[][] => {
    const data = fs
        .readFileSync(fileName, "utf8")
        .split("\n")
        .map((line) => line.slice(1, -1).split('","'));
    return data;
};

const parseTransactionLine = (line: string[]): Transaction | null => {
    if (line.length !== 9) return null;
    const isDebit = line[4].toLowerCase() === "debit";
    const transaction = {
        date: new Date(Date.parse(line[0])),
        description: line[2],
        amount: Number(line[3]) * (isDebit ? -1 : 1),
        tags: [],
    };
    if (isNaN(transaction.amount)) return null;
    return transaction;
};

const readTransactions = (fileName: string): Transaction[] => {
    return readCSV(fileName)
        .map(parseTransactionLine)
        .filter((t) => t !== null);
};

const tag = (transactions: Transaction[]): Transaction[] => {
    const tagged: Transaction[] = [];

    for (const transaction of transactions) {
        const matchingPatterns: string[] = [];
        const tags: Record<string, boolean> = {};
        for (const category of Object.keys(categories)) {
            if (category === "other") continue;
            for (const pattern of categories[category]) {
                if (transaction.description.indexOf(pattern) >= 0) {
                    tags[category] = true;
                    matchingPatterns.push(`${category} "${pattern}"`);
                }
            }
        }
        if (matchingPatterns.length > 1) {
            console.error(
                `Transaction matches twice: ${JSON.stringify(
                    transaction,
                )} \n  ${matchingPatterns.join(",\n  ")}`,
            );
        }
        tagged.push(Object.assign({}, transaction, {tags: Object.keys(tags)}));
    }

    return tagged;
};

const filter = (transactions: Transaction[], tags: string[]): Transaction[] => {
    return transactions.filter((transaction) => {
        for (const filterTag of tags) {
            for (const transactionTag of transaction.tags) {
                if (filterTag === transactionTag) return true;
            }
        }
    });
};

const untagged = (transactions: Transaction[]): Transaction[] => {
    return transactions.filter((transaction) => transaction.tags.length === 0);
};

const sum = (transactions: Transaction[]): number => {
    return transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
    );
};

const print = (transaction: Transaction) => {
    console.log(
        transaction.description.slice(0, 32).padEnd(32),
        transaction.amount.toFixed(2).padStart(9),
        `[${transaction.tags.join(", ")}]`,
    );
};

const transactions = tag(readTransactions(".transactions.csv"));

console.log(sum(filter(transactions, ["food"])));

untagged(transactions).forEach(print);

const spending = readTransactions(".transactions.csv")
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
