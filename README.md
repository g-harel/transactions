# transactions

Combine, categorize, dedupe and query all your transactions.

## Sources

Transaction source directory should contain exported transactions in the form `<source>-[...]`.

### Supported sources

-   [`mint`](https://help.mint.com/Accounts-and-Transactions/888960591/How-can-I-download-my-transactions.htm)

## CLI

```
Commands:
  inspect      Inspect transactions.
  query [sql]  Query transactions.

Options:
  --help       Show help                                               [boolean]
  --version    Show version number                                     [boolean]
  --verbose    Run with verbose logging.                               [boolean]
  --dir        Specify transaction source.
                                   [string] [required] [default: "transactions"]
  --matchfile  Specify matchfile.[string] [required] [default: "matchfile.json"]
```

### Schema

```
id          TEXT -- Arbitrary random ID.
date        TEXT -- Date in ISO format (YYYY-MM-DD).
description TEXT -- Transaction description.
amount      REAL -- Transaction amount relative to self.
tags        TEXT -- Transactoin tags (TODO comma separated)
_original   TEXT -- Original unstructured transaction line.
```

### Examples


