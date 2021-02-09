import {readJSON} from "../ingest/files";
import {error} from "../log";
import {printTransaction, Transaction} from "./transaction";

interface Matcher {
    tags: string[];
    pattern: RegExp;
}

const printMatcher = (matcher: Matcher): string => {
    return `
${matcher.pattern}
-----------------------------
[${matcher.tags.join(", ")}]`.trim();
};

const match = (matcher: Matcher, transaction: Transaction): boolean => {
    for (const description of transaction.descriptions) {
        if (!!description.match(matcher.pattern)) return true;
    }
};

export const tagTransactions = (
    matchFile: string,
    transactions: Transaction[],
): Transaction[] => {
    const tagged: Transaction[] = [];
    const matchers: Matcher[] = readJSON(matchFile).map((m) => {
        m.pattern = new RegExp(m.pattern, "i");
        return m;
    });

    for (const transaction of transactions) {
        let matched: Matcher = null;
        let tags: string[] = [];
        for (const matcher of matchers) {
            if (match(matcher, transaction)) {
                if (matched !== null) {
                    error(
                        "Ambiguous transaction match.",
                        printTransaction(transaction),
                        printMatcher(matched),
                        printMatcher(matcher),
                    );
                }
                tags = matcher.tags;
                matched = matcher;
            }
        }
        if (tags.length === 0) {
            error("Unmatched transaction.", printTransaction(transaction));
        }
        tagged.push(Object.assign({}, transaction, {tags}));
    }

    return tagged;
};
