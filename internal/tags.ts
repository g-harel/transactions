import {readLines} from "./ingest/files";
import {print, Transaction} from "./transaction";

interface Matcher {
    tag: string;
    pattern: RegExp;
    raw: string;
}

const parseMatcherLine = (line: string): Matcher => {
    const parts = line.split(" :: ");
    return {tag: parts[0], pattern: new RegExp(parts[1], "i"), raw: line};
};

const match = (matcher: Matcher, str: string): boolean => {
    return !!str.match(matcher.pattern);
};

export const tagTransactions = (fileName: string, transactions: Transaction[]): Transaction[] => {
    const tagged: Transaction[] = [];

    const matchers = readLines(fileName).filter(Boolean).map(parseMatcherLine);

    for (const transaction of transactions) {
        const matches: Matcher[] = [];
        const tags: Record<string, boolean> = {};
        for (const matcher of matchers) {
            if (match(matcher, transaction.description)) {
                tags[matcher.tag] = true;
                matches.push(matcher);
            }
        }
        if (matches.length > 1) {
            print(transaction);
            console.log("  " + matches.map((m) => m.raw).join(",\n  "));
        }
        tagged.push(Object.assign({}, transaction, {tags: Object.keys(tags)}));
    }

    return tagged;
};