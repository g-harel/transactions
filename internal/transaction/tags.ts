import {readFile} from "../fs";
import {logError} from "../log";
import {printTransaction, Transaction} from "./transaction";

interface Matcher {
    pattern: RegExp;
    tags: string[];
    duplicateSensitivity?: number; // 0-1
}

const printMatcher = (matcher: Matcher): string => {
    return `
${matcher.pattern} [${matcher.tags.join(", ")}]`.trim();
};

export interface MatchedTransaction extends Transaction {
    tags: string[];
    duplicateSensitivity?: number;
}

export const printMatchedTransaction = (
    transaction: MatchedTransaction,
): string => {
    return printTransaction(transaction).replace(
        "\n",
        ` [${transaction.tags.join(", ")}]\n`,
    );
};

const match = (matcher: Matcher, transaction: Transaction): boolean => {
    for (const description of transaction.descriptions) {
        if (!!description.match(matcher.pattern)) return true;
    }
};

export const tagTransactions = (
    matchFile: string,
    transactions: Transaction[],
): MatchedTransaction[] => {
    const tagged: MatchedTransaction[] = [];
    const matchers: Matcher[] = JSON.parse(readFile(matchFile)).map((m) => {
        m.pattern = new RegExp(m.pattern, "i");
        return m;
    });

    for (const transaction of transactions) {
        let matched: Matcher = null;
        for (const matcher of matchers) {
            if (match(matcher, transaction)) {
                if (matched !== null) {
                    logError(
                        "Ambiguous transaction match.",
                        printTransaction(transaction),
                        printMatcher(matched),
                        printMatcher(matcher),
                    );
                }
                matched = matcher;
            }
        }
        if (matched === null) {
            logError("Unmatched transaction.", printTransaction(transaction));
            continue;
        }
        tagged.push(
            Object.assign({}, transaction, {
                tags: matched.tags,
                duplicateSensitivity: matched.duplicateSensitivity,
            }),
        );
    }

    return tagged;
};
