import chalk from "chalk";

interface LogFn {
    (message: string, ...artifacts: any[]): void;
}

const logFn = (label: string, c: chalk.Chalk): LogFn => {
    return (message, ...artifacts) => {
        console.log(c(label), message);

        for (let i = 0; i < artifacts.length; i++) {
            const lines = String(artifacts[i]).split("\n");
            for (let j = 0; j < lines.length; j++) {
                console.log(c("│"), chalk.grey(lines[j]));

                const isLastArtifact = i === artifacts.length - 1;
                const isLastLine = j === lines.length - 1;
                if (isLastLine) {
                    if (isLastArtifact) {
                        console.log(c("└────────"));
                    } else {
                        console.log(c("├────────"));
                    }
                }
            }
        }
    };
};

export const logInfo = logFn("INFO", chalk.bold.green);
export const logError = logFn("ERROR", chalk.bold.red);
export const logDebug = logFn("DEBUG", chalk.bold.blue);
