import {MatchedTransaction} from "./match";
import {Transaction} from "./transaction";

export const filter = (
    transactions: MatchedTransaction[],
    tags: string[],
): MatchedTransaction[] => {
    return transactions.filter((transaction) => {
        for (const filterTag of tags) {
            for (const transactionTag of transaction.matcher.tags) {
                if (filterTag === transactionTag) return true;
            }
        }
    });
};

export const untagged = (
    transactions: MatchedTransaction[],
): MatchedTransaction[] => {
    return transactions.filter(
        (transaction) => transaction.matcher.tags.length === 0,
    );
};

export const sum = (transactions: Transaction[]): number => {
    return transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
    );
};

export const sort = <T extends Transaction>(transactions: T[]): T[] => {
    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
};
