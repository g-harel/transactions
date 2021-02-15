import path from "path";

import glob from "glob";

import {Transaction} from "./transaction";
import {readFile} from "./fs";
import {logError, logInfo} from "./log";
import {genID} from "./id";

const readLines = (fileName: string): string[] => {
    return readFile(fileName).split("\n");
};

const readCSV = (fileName: string): string[][] => {
    return (
        readLines(fileName)
            // TODO: Support CSV files formatted without apostrophes.
            .map((line) => line.slice(1, -1).split('","'))
    );
};

export const slurpMint = (fileName: string): Transaction[] => {
    const parseMintLine = (line: string[]): Transaction | null => {
        if (line.length !== 9) return null;
        const isDebit = line[4].toLowerCase() === "debit";
        const transaction = {
            id: genID(),
            date: new Date(Date.parse(line[0])),
            descriptions: [line[1], line[2]],
            amount: Number(line[3]) * (isDebit ? -1 : 1),
            tags: [],
        };
        if (isNaN(transaction.amount)) return null;
        return transaction;
    };

    return readCSV(fileName)
        .map(parseMintLine)
        .filter((t) => t !== null);
};

const sources: Record<string, (f: string) => Transaction[]> = {
    mint: slurpMint,
};

export const slurp = (dir: string): Transaction[] => {
    const fileNames = glob.sync(path.join(dir, "*-*.*"));

    let transactions = [];
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
