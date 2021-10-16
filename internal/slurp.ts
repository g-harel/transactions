import path from "path";

import csvParse from "csv-parse/lib/sync";
import glob from "glob";

import {Transaction} from "./transaction";
import {readFile} from "./fs";
import {logError, logInfo} from "./log";
import {genID} from "./id";
import {fDate} from "./format";

export const slurpMint = (fileName: string): Transaction[] => {
    const parseMintLine = (line: any): Transaction | null => {
        const isDebit = line["Transaction Type"].toLowerCase() === "debit";
        const transaction = {
            id: genID(),
            date: fDate(new Date(Date.parse(line["Date"]))),
            descriptions: [line["Description"], line["Original Description"]],
            amount: Number(line["Amount"]) * (isDebit ? -1 : 1),
            tags: [],
        };
        if (isNaN(transaction.amount)) return null;
        return transaction;
    };

    return csvParse(readFile(fileName), {columns: true})
        .map(parseMintLine)
        .filter((t: any) => t !== null);
};

const sources: Record<string, (f: string) => Transaction[]> = {
    mint: slurpMint,
};

export const slurp = (dir: string): Transaction[] => {
    const fileNames = glob.sync(path.join(dir, "*-*.*"));

    let transactions: Transaction[] = [];
    for (const fileName of fileNames) {
        const match = path.basename(fileName).match(/(\w+)-\d+\.\w+/);
        if (match === null || match.length < 1) {
            logError("Invalid transaction file name.", fileName);
            return [];
        }
        const source = match[1];
        if (sources[source] === undefined) {
            logError(
                "Unknown source.",
                `"${source}" not in ["${Object.keys(sources).join('", "')}"]`,
            );
            return [];
        }
        logInfo(`Reading "${path.basename(fileName)}" as "${source}" source.`);
        transactions = transactions.concat(...sources[source](fileName));
    }

    return transactions;
};
