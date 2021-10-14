import {fTransaction} from "./format";
import {readFile} from "./fs";
import {genID} from "./id";
import {logError} from "./log";
import {Transaction} from "./transaction";

interface Matcher {
    id: string;
    pattern: RegExp;
    tags: string[];
    duplicateSensitivity?: number; // 0-1 (-1 for never duplicate)
    strict: boolean;
}

const printMatcher = (matcher: Matcher): string => {
    return `
#${matcher.id} ${matcher.pattern} [${matcher.tags.join(", ")}]`.trim();
};

export interface MatchedTransaction extends Transaction {
    matcher: Matcher;
}

const match = (matcher: Matcher, transaction: Transaction): boolean => {
    for (const description of transaction.descriptions) {
        if (description.match(matcher.pattern)) {
            if (!matcher.strict) return true;
        } else {
            if (matcher.strict) return false;
        }
    }
    return matcher.strict;
};

export const tagTransactions = (
    matchFile: string,
    transactions: Transaction[],
): MatchedTransaction[] => {
    const tagged: MatchedTransaction[] = [];
    const matchers: Matcher[] = JSON.parse(readFile(matchFile)).map((m) => {
        m.id = genID();
        m.pattern = new RegExp(m.pattern, "i");
        m.duplicateSensitivity = m.duplicateSensitivity || 0;
        m.strict = m.strict || false;
        return m;
    });

    for (const transaction of transactions) {
        let matched: Matcher = null;
        for (const matcher of matchers) {
            if (match(matcher, transaction)) {
                if (matched !== null) {
                    logError(
                        "Ambiguous transaction match.",
                        fTransaction(transaction),
                        printMatcher(matched),
                        printMatcher(matcher),
                    );
                }
                matched = matcher;
            }
        }
        if (matched === null) {
            logError("Unmatched transaction.", fTransaction(transaction));
            continue;
        }
        tagged.push(Object.assign({}, transaction, {matcher: matched}));
    }

    return tagged;
};
