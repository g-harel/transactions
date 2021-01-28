export interface Transaction {
    date: Date;
    description: string;
    amount: number;
    tags: string[];
}

export const filter = (transactions: Transaction[], tags: string[]): Transaction[] => {
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

export const print = (transaction: Transaction) => {
    console.log(
        transaction.description.padEnd(32),
        transaction.amount.toFixed(2).padStart(9),
        `[${transaction.tags.join(", ")}]`,
    );
};
