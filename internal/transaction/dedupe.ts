import {print, Transaction} from "./transaction";

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
                    if (daysDifference(current, compare) < 7) {
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
