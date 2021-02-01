export interface Transaction {
    id: string;
    date: Date;
    descriptions: string[];
    amount: number;
    tags: string[];
}

export const print = (transaction: Transaction): string => {
    const descriptions: Record<string, boolean> = {};
    for (const description of transaction.descriptions) {
        descriptions[description] = true;
    }
    return [
        transaction.id,
        Object.keys(descriptions).join("|").slice(0, 42).padEnd(42),
        transaction.amount.toFixed(2).padStart(9),
        transaction.date.toISOString().slice(0, 10),
        `[${transaction.tags.join(", ")}]`,
    ].join(" ");
};
