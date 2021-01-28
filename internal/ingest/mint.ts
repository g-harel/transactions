import {Transaction} from "../transaction";
import {readCSV} from "./files";

const parseTransactionLine = (line: string[]): Transaction | null => {
    if (line.length !== 9) return null;
    const isDebit = line[4].toLowerCase() === "debit";
    const transaction = {
        date: new Date(Date.parse(line[0])),
        description: line[2],
        amount: Number(line[3]) * (isDebit ? -1 : 1),
        tags: [],
    };
    if (isNaN(transaction.amount)) return null;
    return transaction;
};

export const readMintArchive = (fileName: string): Transaction[] => {
    return readCSV(fileName)
        .map(parseTransactionLine)
        .filter((t) => t !== null);
};
