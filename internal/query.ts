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
    return transactions.sort((a, b) => a.date.localeCompare(b.date));
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

    interface TagNode {
        tag: string;
        children: TagNode[];
    }

    const buildTree = (sortedTags: string[]): TagNode[] => {
        if (sortedTags.length === 0) return [];

        const layer = [];
        const remainingTags = sortedTags.slice();

        // Add all tags that never appear with others in the layer.
        // Tags in this layer are removed from the list of remaining ones.
        for (let i = 0; i < sortedTags.length; i++) {
            let found = false;
            for (const layerSibling of layer) {
                if (tagCombos[sortedTags[i]][layerSibling]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                layer.push(sortedTags[i]);
                remainingTags.splice(i, 0);
            }
        }

        // Recur over remaining tags, but only those that have been seen to be
        // combined with the individual layer tag.
        return layer.map((layerTag) => {
            const remainingCombos = remainingTags.filter((tag) => {
                return tagCombos[layerTag][tag];
            });
            return {
                tag: layerTag,
                children: buildTree(remainingCombos),
            };
        });
    };

    const printTree = (tree: TagNode): string[] => {
        const printed = [tree.tag];
        const children = Object.values(tree.children);
        for (let i = 0; i < children.length; i++) {
            const printedChild = printTree(children[i]);
            for (let j = 0; j < printedChild.length; j++) {
                let prefix = "│ ";
                if (i === children.length - 1) {
                    prefix = "  ";
                }
                if (j === 0) {
                    if (i === children.length - 1) {
                        prefix = "└─";
                    } else {
                        prefix = "├─";
                    }
                }
                printed.push(prefix + printedChild[j]);
            }
        }
        return printed;
    };

    const allSortedTags = Object.entries(tagComboFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);
    return printTree({
        tag: "*",
        children: buildTree(allSortedTags),
    }).join("\n");
};
