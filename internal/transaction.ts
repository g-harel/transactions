export interface Transaction {
    id: string;
    date: Date;
    descriptions: string[];
    amount: number;
    tags: string[];
}

const isPayPal = (transaction: Transaction): boolean => {
    for (const description of transaction.descriptions) {
        if (description.toLowerCase().indexOf("paypal") >= 0) {
            return true;
        }
    }
    return false;
};

const daysDifference = (a: Transaction, b: Transaction): number => {
    const dayMs = 1000 * 60 * 60 * 24;
    return Math.abs(a.date.getTime() - b.date.getTime()) / dayMs;
};

export const dedupe = (transactions: Transaction[]): Transaction[] => {
    const amountMap: {[amount: number]: Transaction[]} = {};

    for (const transaction of transactions) {
        if (amountMap[transaction.amount] === undefined) {
            amountMap[transaction.amount] = [];
        }
        amountMap[transaction.amount].push(transaction);
    }

    const result: Transaction[] = [];
    for (const similarTransactions of Object.values(amountMap)) {
        for (let i = 0; i < similarTransactions.length; i++) {
            let isDuplicate = false;
            for (let j = 1; j < similarTransactions.length; j++) {
                const current = similarTransactions[i];
                const compare = similarTransactions[j];
                if (isPayPal(current) || isPayPal(compare)) {
                    if (daysDifference(current, compare) < 4) {
                        isDuplicate = true;
                        console.log(print(current));
                        console.log(print(compare));
                        console.log("====");
                    }
                }
            }
            if (!isDuplicate) result.push(similarTransactions[i]);
        }
    }

    return result;
};

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

export const print = (transaction: Transaction): string => {
    const descriptions: Record<string, boolean> = {};
    for (const description of transaction.descriptions) {
        descriptions[description] = true;
    }
    return [
        transaction.id,
        Object.keys(descriptions).join("|").slice(0, 42).padEnd(42),
        transaction.amount.toFixed(2).padStart(9),
        transaction.date.toISOString().slice(0, 10),
        `[${transaction.tags.join(", ")}]`,
    ].join(" ");
};
