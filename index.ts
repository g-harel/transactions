import * as fs from "fs";
import {categories} from "./categories";

interface Transaction {
    date: Date;
    description: string;
    amount: number;
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
    };
    if (isNaN(transaction.amount)) return null;
    return transaction;
};

const readTransactions = (fileName: string): Transaction[] => {
    return readCSV(fileName)
        .map(parseTransactionLine)
        .filter((t) => t !== null);
};

const categorize = (transactions: Transaction[]) => {
    const categorized: {
        [_ in keyof typeof categories]: Transaction[];
    } = {} as any;
    for (const category of Object.keys(categories)) {
        categorized[category] = [];
    }

    for (const transaction of transactions) {
        let matchingPatterns: string[] = [];
        for (const category of Object.keys(categories)) {
            if (category === "other") continue;
            for (const pattern of categories[category]) {
                if (transaction.description.indexOf(pattern) >= 0) {
                    categorized[category].push(transaction);
                    matchingPatterns.push(`${category} "${pattern}"`);
                    break;
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
        if (matchingPatterns.length === 0) {
            categorized.other.push(transaction);
        }
    }
    return categorized;
};

const transactions = categorize(readTransactions(".transactions.csv"));

const sum = (...transactions: Transaction[]): number => {
    return transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
    );
};

const format = (transaction: Transaction): string => {
    return `${transaction.description
        .slice(0, 48)
        .padEnd(48)} ${transaction.amount.toFixed(2).padStart(16)}`;
};

const print = (str: string) => console.log(str);

console.log(sum(...transactions.food));

transactions.other.map(format).forEach(print);

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
