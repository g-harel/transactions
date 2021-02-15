export interface Transaction {
    id: string;
    date: Date;
    descriptions: string[];
    amount: number;
}

export const printTransaction = (transaction: Transaction): string => {
    const descriptions: Record<string, boolean> = {};
    for (const description of transaction.descriptions) {
        descriptions[description] = true;
    }
    const date = transaction.date.toISOString().slice(0, 10);
    const amount = transaction.amount.toFixed(2);
    return `
#${transaction.id} ${date} ${amount}
${transaction.descriptions.join(" - ")}`.trim();
};
