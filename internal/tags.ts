import {readLines} from "./ingest/files";
import {print, Transaction} from "./transaction";

interface Matcher {
    tags: string[];
    pattern: RegExp;
    raw: string;
}

const parseMatcherLine = (line: string): Matcher => {
    // TODO detect broken lines (parts.length > 2).
    const parts = line.split(" :: ");
    return {
        tags: parts[0].split(" "),
        pattern: new RegExp(parts[1], "i"),
        raw: line,
    };
};

const match = (matcher: Matcher, transaction: Transaction): boolean => {
    for (const description of transaction.descriptions) {
        if (!!description.match(matcher.pattern)) return true;
    }
};

export const tagTransactions = (
    fileName: string,
    transactions: Transaction[],
): Transaction[] => {
    const tagged: Transaction[] = [];
    const matchers = readLines(fileName).filter(Boolean).map(parseMatcherLine);

    for (const transaction of transactions) {
        let matched: Matcher = null;
        let tags: string[] = [];
        for (const matcher of matchers) {
            if (match(matcher, transaction)) {
                if (matched !== null) {
                    console.log("ERROR Multiple:", print(transaction));
                    console.log("  " + matched.raw);
                    console.log("  " + matcher.raw);
                }
                tags = matcher.tags;
                matched = matcher;
            }
        }
        if (tags.length === 0) {
            console.log("ERROR Unmatched:", print(transaction));
        }
        tagged.push(Object.assign({}, transaction, {tags}));
    }

    return tagged;
};
