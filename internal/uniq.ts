import {fTransaction} from "./format";
import {logDebug, logInfo} from "./log";
import {MatchedTransaction} from "./match";
import {Transaction} from "./transaction";

const daysDifference = (a: Transaction, b: Transaction): number => {
    const dayMs = 1000 * 60 * 60 * 24;
    return Math.abs(Date.parse(a.date) - Date.parse(b.date)) / dayMs;
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

    return similarity;
};

// https://www.desmos.com/calculator/atfh1nekmi
const rateQuad = (rating: number, max: number): number => {
    if (rating < 0) return 1;
    if (rating > max) return 0;
    return 1 - (rating / max) ** 2;
};
const rateSin = (rating: number, max: number): number => {
    if (rating < 0) return 1;
    if (rating > max) return 0;
    return 0.5 + 0.5 * Math.sin((rating / max) * Math.PI + 0.5 * Math.PI);
};
const rateExp = (rating: number, halfLife: number): number => {
    return 1 / (1 + rating / halfLife);
};

const weightedAvg = (entries: [number, number][]): number => {
    let totalValues = 0;
    let totalParts = 0;
    for (const entry of entries) {
        totalValues += entry[1] * entry[0];
        totalParts += entry[0];
    }
    return totalValues / totalParts;
};

export const dedupe = (
    transactions: MatchedTransaction[],
    logAsInfo = false,
): MatchedTransaction[] => {
    const amountMap: {[amount: number]: MatchedTransaction[]} = {};

    for (const transaction of transactions) {
        if (amountMap[transaction.amount] === undefined) {
            amountMap[transaction.amount] = [];
        }
        amountMap[transaction.amount].push(transaction);
    }

    const result: MatchedTransaction[] = [];
    const compared: Record<string, boolean> = {};
    for (const siblings of Object.values(amountMap)) {
        for (let i = 0; i < siblings.length; i++) {
            const current = siblings[i];
            if (current.matcher.duplicateSensitivity === -1) {
                result.push(current);
                continue;
            }

            let isDuplicate = false;
            for (let j = i + 1; j < siblings.length; j++) {
                const compare = siblings[j];
                if (compare.matcher.duplicateSensitivity === -1) continue;

                const compareKey = [current.id, compare.id].sort().join("-");
                const firstCompared = !compared[compareKey]
                compared[compareKey] = true;

                // Higher scores mean higher chance of being similar.
                // Score should stay between 0 and 1 inclusive.

                const quickScore = weightedAvg([
                    [3, rateSin(daysDifference(current, compare), 9)],
                    [3, current.matcher.id === compare.matcher.id ? 1 : 0],
                    [2, current.matcher.duplicateSensitivity],
                    [2, compare.matcher.duplicateSensitivity],
                    [1, rateExp(siblings.length - 1, 2)],
                ]);
                if (quickScore < 0.5) {
                    firstCompared &&
                        logDebug(
                            `Possible duplicate transactions (${quickScore})`,
                            fTransaction(current),
                            fTransaction(compare),
                        );
                    continue;
                }

                const totalScore = weightedAvg([
                    [1, descriptionSimilarity(current, compare)],
                    [2, quickScore],
                ]);

                if (totalScore > 0.5) {
                    (logAsInfo ? logInfo : logDebug)(
                        `Duplicate transactions (${totalScore} - ${quickScore})`,
                        fTransaction(current),
                        fTransaction(compare),
                    );
                    isDuplicate = true;
                    break;
                } else {
                    firstCompared &&
                        logDebug(
                            `Possible duplicate transactions (${totalScore})`,
                            fTransaction(current),
                            fTransaction(compare),
                        );
                }
            }
            if (!isDuplicate) result.push(current);
        }
    }

    return result;
};
