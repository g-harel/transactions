import * as fs from "fs";

export const readFile = (fileName: string): string => {
    return fs.readFileSync(fileName, "utf8");
};
