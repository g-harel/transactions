import {MatchedTransaction} from "./match";
import {Transaction} from "./transaction";

export const fNumber = (n: number): string => {
    return n.toFixed(2).padStart(9);
};

export const fDate = (d: Date): string => {
    if (isNaN(d as any)) {
        return "";
    }
    return d.toISOString().slice(0, 10);
};

const fTags = (t: string[]) => {
    return `[${t.join(", ")}]`;
};

export const fTransaction = (
    transaction: Transaction | MatchedTransaction,
): string => {
    return `
#${transaction.id} ${transaction.date} ${fNumber(transaction.amount)}
${transaction.descriptions.join(" - ")}`.trim();
};

export const fTransactionLine = (
    transaction: Transaction | MatchedTransaction,
) => {
    const tags = (transaction as any)?.matcher?.tags
        ? fTags((transaction as any).matcher.tags)
        : "";
    return [
        transaction.date,
        fNumber(transaction.amount),
        transaction.descriptions.join(" - "),
        tags,
    ]
        .join(" ")
        .trim();
};

export const fMatchedTransaction = (
    transaction: MatchedTransaction,
): string => {
    return fTransaction(transaction).replace(
        "\n",
        ` [${transaction.matcher.tags.join(", ")}]\n`,
    );
};

export const fQuery = (q: string) => {
    const lines = q.split("\n");
    let min = Infinity;
    for (const line of lines) {
        if (line === "") continue;
        min = Math.min(min, line.length - line.trimStart().length);
    }
    return lines
        .filter((line) => line.trim() !== "")
        .map((line) => line.substr(min))
        .join("\n");
};
