export const genID = (): string => {
    return String(Math.random()).slice(2, 10).padEnd(8, "0");
};
