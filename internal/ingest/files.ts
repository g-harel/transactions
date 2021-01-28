import * as fs from "fs";

const readFile = (fileName: string): string => {
    return fs.readFileSync(fileName, "utf8");
};

export const readLines = (fileName: string): string[] => {
    return readFile(fileName).split("\n");
};

export const readCSV = (fileName: string): string[][] => {
    return (
        readLines(fileName)
            // TODO: Support CSV files formatted without apostrophes.
            .map((line) => line.slice(1, -1).split('","'))
    );
};
