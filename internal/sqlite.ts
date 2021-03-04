import sqlite3 from "sqlite3";
import {fDate} from "./format";
import {logInfo, logError} from "./log";
import {MatchedTransaction} from "./match";

let db: sqlite3.Database;

const statementCallback = (err, result) => {
    if (err != null) {
        logError("Database error", err);
        return;
    }
    if (result != null) {
        logInfo("Result", result);
    }
};

export const init = () => {
    db = new sqlite3.Database(":memory:");
    db.serialize(() => {
        const sql = `CREATE TABLE t (
    id          TEXT,
    date        TEXT,
    description TEXT,
    amount      REAL,
    tags        TEXT
)`;
        logInfo("sqlite3", sql);
        db.run(sql, statementCallback);
    });
};

let hasWritten = false;
export const write = (transactions: MatchedTransaction[]) => {
    if (!db) {
        logError("Database not initialized.");
        return;
    }
    if (hasWritten) logError("Multiple writes to database.");

    for (const transaction of transactions) {
        const sql = `INSERT INTO t VALUES (
    '${transaction.id}',
    '${fDate(transaction.date)}',
    '${transaction.descriptions.join(", ")}',
    ${transaction.amount},
    '${transaction.matcher.tags.join(", ")}'
)`;
        db.run(sql, statementCallback);
    }
};

// TODO catch errors.
export const query = (sql: string): MatchedTransaction[] => {
    if (!db) {
        logError("Database not initialized.");
        return [];
    }
    logInfo("sqlite3", sql);
    db.all(sql, (err, rows) => {
        if (err != null) {
            logError("Database error", err);
        }
        // console.log(rows);
    });
    return [];
};
