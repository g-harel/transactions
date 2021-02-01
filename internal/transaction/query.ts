import {Transaction} from "./transaction";

export const filter = (
    transactions: Transaction[],
    tags: string[],
): Transaction[] => {
    return transactions.filter((transaction) => {
        for (const filterTag of tags) {
            for (const transactionTag of transaction.tags) {
                if (filterTag === transactionTag) return true;
            }
        }
    });
};

export const untagged = (transactions: Transaction[]): Transaction[] => {
    return transactions.filter((transaction) => transaction.tags.length === 0);
};

export const sum = (transactions: Transaction[]): number => {
    return transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
    );
};

export const sort = (transactions: Transaction[]): Transaction[] => {
    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
};
