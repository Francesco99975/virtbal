import Transaction from "./transaction";

export interface ParsedData {
  transactions: Transaction[];
  startingBalance: number;
  date: Date;
}
