export interface Transaction {
    date: Date;
    descriptions: string[];
    amount: number;
    tags: string[];
}

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

export const print = (transaction: Transaction): string => {
    const descriptions: Record<string, boolean> = {};
    for (const description of transaction.descriptions) {
        descriptions[description] = true;
    }
    return [
        Object.keys(descriptions).join("|").slice(0, 42).padEnd(42),
        transaction.amount.toFixed(2).padStart(9),
        transaction.date.toISOString().slice(0, 10),
        `[${transaction.tags.join(", ")}]`,
    ].join(" ");
};
