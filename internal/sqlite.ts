import sqlite3 from "sqlite3";
import {fQuery} from "./format";
import {logDebug, logError} from "./log";
import {MatchedTransaction} from "./match";

let db: sqlite3.Database;

const logErr = (err: Error) => {
    if (err) logError("Database error", String(err));
};

const sync = () => {
    let resolve = () => {};
    let reject = () => {};
    const p = new Promise<void>((rs, rj) => {
        resolve = rs;
        reject = rj;
    });
    return {
        done: resolve,
        err: reject,
        wait: p,
    };
};

const checkInit = () => {
    if (!db) throw "not initialized";
    return false;
};

export const init = async () => {
    const createDatabase = sync();
    db = new sqlite3.Database(":memory:", (err) => {
        logErr(err);
        createDatabase.done();
    });
    await createDatabase.wait;

    const sql = `
        CREATE TABLE transactions (
            id          TEXT,
            date        TEXT,
            description TEXT,
            amount      REAL,
            tags        TEXT,
            _original   TEXT
        )`;
    logDebug("sqlite3", fQuery(sql));

    const createTable = sync();
    db.run(sql, (_, err: Error) => {
        logErr(err);
        createTable.done();
    });
    await createTable.wait;
};

let hasWritten = false;
export const write = async (transactions: MatchedTransaction[]) => {
    if (checkInit()) return [];
    if (hasWritten) logError("Multiple writes to database.");

    await Promise.all(
        transactions.map(async (transaction) => {
            // TODO use parameters instead.
            const sql = `INSERT INTO transactions VALUES (
    '${transaction.id}',
    '${transaction.date}',
    '${transaction.descriptions.join(", ")}',
    ${transaction.amount},
    '${transaction.matcher.tags.join(", ")}',
    '${JSON.stringify(transaction)}'
)`;

            const insertTransaction = sync();
            db.run(sql, (_, err: Error) => {
                logErr(err);
                insertTransaction.done();
            });
            await insertTransaction.wait;
        }),
    );
};

export const query = async (sql: string): Promise<MatchedTransaction[]> => {
    if (checkInit()) return [];

    logDebug("sqlite3", fQuery(sql));

    let rows: any[] = [];
    const runQuery = sync();
    db.all(sql, (err, result) => {
        logErr(err);
        if (!err) rows = result;
        runQuery.done();
    });
    await runQuery.wait;

    try {
        return rows.map((row) => JSON.parse(row._original));
    } catch {
        logError("Unexpected query result", rows);
        return [];
    }
};
