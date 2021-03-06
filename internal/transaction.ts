export interface Transaction {
    id: string;
    date: string; // YYYY-MM-DD
    descriptions: string[];
    amount: number;
}
