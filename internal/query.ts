import {logInfo} from "./log";
import {MatchedTransaction} from "./match";
import {Transaction} from "./transaction";

export const filter = (
    transactions: MatchedTransaction[],
    tags: string[],
): MatchedTransaction[] => {
    return transactions.filter((transaction) => {
        for (const filterTag of tags) {
            for (const transactionTag of transaction.matcher.tags) {
                if (filterTag === transactionTag) return true;
            }
        }
    });
};

export const untagged = (
    transactions: MatchedTransaction[],
): MatchedTransaction[] => {
    return transactions.filter(
        (transaction) => transaction.matcher.tags.length === 0,
    );
};

export const sum = (transactions: Transaction[]): number => {
    return transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
    );
};

export const sort = <T extends Transaction>(transactions: T[]): T[] => {
    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const tagTree = (transactions: MatchedTransaction[]): string => {
    const tagCombos: Record<string, Record<string, boolean>> = {};
    const tagFrequency: Record<string, number> = {};
    const tagComboFrequency: Record<string, number> = {};
    for (const transaction of transactions) {
        for (const tag of transaction.matcher.tags) {
            if (tagFrequency[tag] === undefined) {
                tagFrequency[tag] = 0;
            }
            tagFrequency[tag]++;

            for (const otherTag of transaction.matcher.tags) {
                if (tag === otherTag) continue;

                if (tagComboFrequency[tag] === undefined) {
                    tagComboFrequency[tag] = 0;
                }
                tagComboFrequency[tag]++;

                if (tagCombos[tag] === undefined) {
                    tagCombos[tag] = {};
                }
                tagCombos[tag][otherTag] = true;
            }
        }
    }

    const tags = Object.keys(tagCombos);
    const tagCount = tags.length;
    const orderedTags = Object.entries(tagComboFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({tag, count}));


    interface TagTree {
        tag: string;
        children: Record<string, TagTree>;
    }

    const rootTag: TagTree = {
        tag: "root",
        children: {
            [orderedTags[0].tag]: {
                tag: orderedTags[0].tag,
                children: {},
            },
        },
    };
    // TODO make recursive.
    for (let i = 0; i < tagCount; i++) {
        const {tag} = orderedTags[i];
        let found = false;
        for (const siblingTag of Object.keys(rootTag.children)) {
            if (tagCombos[tag][siblingTag]) {
                found = true;
                break;
            };
        }
        if (found) continue;
        rootTag.children[tag] = {tag, children: {}};
    }

    logInfo("tagCombos", JSON.stringify(tagCombos, null, 2));
    logInfo("orderedTags", orderedTags.map((o) => JSON.stringify(o)).join("\n"));
    logInfo("rootTag", JSON.stringify(rootTag, null, 2));

    const printTree = (tree: TagTree): string[] => {
        const printed = [tree.tag];
        const children = Object.values(tree.children);
        for (let i = 0; i < children.length; i++) {
            const printedChild = printTree(children[i]);
            for (let j = 0; j < printedChild.length; j++) {
                let prefix = "│ ";
                if (i === children.length - 1) {
                    prefix = "  "
                }
                if (j === 0) {
                    if (i === children.length - 1) {
                        prefix = "└─"
                    } else {
                        prefix = "├─"
                    }
                }
                printed.push(prefix + printedChild[j]);
            }
        }
        return printed;
    }

    console.log(printTree({
        tag: "test",
        children: {
            test: {
                tag: "test",
                children: {
                    test: {
                        tag: "test",
                        children: {
                            test: {
                                tag: "test",
                                children: {},
                            },
                            test2: {
                                tag: "test",
                                children: {},
                            },
                        },
                    },
                },
            },
            test2: {
                tag: "test",
                children: {
                    test: {
                        tag: "test",
                        children: {},
                    },
                },
            },
        }
    }).join("\n"));

    return printTree(rootTag).join("\n");
};
