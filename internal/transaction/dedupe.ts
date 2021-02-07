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

const descriptionTokens = (transaction: Transaction): string[] => {
    return transaction.descriptions
        .map((s) => s.split(/\W/))
        .reduce((acc, val) => acc.concat(val), [])
        .filter(Boolean)
        .map((token) => token.toLowerCase());
};

const distanceRating = (a: string, b: string) => {
    const editDistance = (m: number, n: number): number => {
        if (m === 0) return n;
        if (n === 0) return m;

        if (a[m - 1] === b[n - 1]) {
            return editDistance(m - 1, n - 1);
        }

        return (
            1 +
            Math.min(
                editDistance(m, n - 1), // Insert
                editDistance(m - 1, n), // Remove
                editDistance(m - 1, n - 1), // Replace
            )
        );
    };

    const max = Math.max(a.length, b.length);
    return 1 - editDistance(a.length, b.length) / max;
};

const substringRating = (a: string, b: string): number => {
    let max = 0;
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            const maxSubstring = Math.min(a.length - i, b.length - i);
            for (let k = 0; k < maxSubstring; k++) {
                if (a[i + k] !== b[j + k]) break;
                max = Math.max(max, k + 1);
            }
        }
    }
    return max / Math.min(a.length, b.length);
};

const descriptionSimilarity = (a: Transaction, b: Transaction): number => {
    const aTokens = descriptionTokens(a);
    const bTokens = descriptionTokens(b);
    const tokenCount = aTokens.length + bTokens.length;

    let similarities: number[] = [];
    for (const aToken of aTokens) {
        for (const bToken of bTokens) {
            // Score should stay between 0 and 1 inclusive.
            const similarity =
                distanceRating(aToken, bToken) / 2 +
                substringRating(aToken, bToken) / 2;
            similarities.push(similarity);
        }
    }

    // Only consider best scores.
    similarities = similarities.sort().slice(-tokenCount);

    const similarity = similarities.reduce((acc, n) => acc + n, 0) / tokenCount;

    // TODO Boost paypal similarity.
    // if (isPayPal(a) || isPayPal(b)) {
    //     return 1 - (1 - similarity) / Math.sqrt(2);
    // }

    return similarity;
};

// TODO add optional matcher duplicate sensitivity.
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
            for (let j = i + 1; j < similarTransactions.length; j++) {
                const current = similarTransactions[i];
                const compare = similarTransactions[j];

                // Higher values mean higher chance of being different.
                // Score should stay between 0 and 1 inclusive.
                const descScore = 1 - descriptionSimilarity(current, compare);
                const dateScore = 1 / (1 + daysDifference(current, compare));
                const siblingScore = 1 / (1 + (similarTransactions.length - 1));
                const similarity = (descScore + dateScore + siblingScore) / 3;

                // TODO make more sensitive to date deltas.
                if (similarity < 0.3) {
                    console.log(print(current));
                    console.log(print(compare));
                    console.log("====", similarity);
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) result.push(similarTransactions[i]);
        }
    }

    return result;
};
