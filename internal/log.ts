interface LogFn {
    (...messages: any[]): void;
}

const logFn = (label: string): LogFn => (...m) => {
    console.log((label + ":").padEnd(6, " "), ...m);
};

export const info = logFn("INFO");
export const error = logFn("ERROR");
export const debug = logFn("DEBUG");
