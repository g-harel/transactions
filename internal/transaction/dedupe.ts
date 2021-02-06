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

const editDistance = (a: string, b: string, m: number, n: number): number => {
    if (m === 0) return n;
    if (n === 0) return m;

    if (a[m - 1] === b[n - 1]) {
        return editDistance(a, b, m - 1, n - 1);
    }

    return (
        1 +
        Math.min(
            editDistance(a, b, m, n - 1), // Insert
            editDistance(a, b, m - 1, n), // Remove
            editDistance(a, b, m - 1, n - 1), // Replace
        )
    );
};

const longestSubstring = (a: string, b: string): number => {
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
    return max;
};

// console.log(longestSubstring("abc", "1abc1"));
// console.log(longestSubstring("abc", "cba"));
// console.log(longestSubstring("a", "b"));
// console.log(longestSubstring("11122", "2211a1"));

const stringSimilarity = (a: string, b: string): number => {
    const maxDistance = Math.max(a.length, b.length);
    const adjustedDistance =
        1 - editDistance(a, b, a.length, b.length) / maxDistance;

    const maxSubstring = Math.min(a.length, b.length);
    const adjustedSubstring = longestSubstring(a, b) / maxSubstring;

    return (adjustedDistance + adjustedSubstring) / 2;
};

// console.log(stringSimilarity("123aaa", "123"));
// console.log(stringSimilarity("aaa123", "123"));
// console.log(stringSimilarity("123", "123aaa"));
// console.log(stringSimilarity("123", "aaa123"));

// console.log(stringSimilarity("1234567890aaa", "1234567890"));
// console.log(stringSimilarity("aaa1234567890", "1234567890"));
// console.log(stringSimilarity("1234567890", "1234567890aaa"));
// console.log(stringSimilarity("1234567890", "aaa1234567890"));

const descriptionSimilarity = (a: Transaction, b: Transaction): number => {
    const aTokens = descriptionTokens(a);
    const bTokens = descriptionTokens(b);
    const tokenCount = aTokens.length + bTokens.length;

    let similarities: number[] = [];
    for (const aToken of aTokens) {
        for (const bToken of bTokens) {
            const similarity = stringSimilarity(aToken, bToken);
            // console.log(aToken, bToken, similarity);
            similarities.push(similarity);
        }
    }

    // Only consider best scores.
    similarities = similarities.sort().slice(-tokenCount);

    return similarities.reduce((acc, n) => acc + n, 0) / tokenCount;
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
                        console.log(
                            "====",
                            descriptionSimilarity(current, compare),
                        );
                        break;
                    }
                }
            }
            if (!isDuplicate) result.push(similarTransactions[i]);
        }
    }

    return result;
};
