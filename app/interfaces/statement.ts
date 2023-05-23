import Transaction from "./transaction";

export interface Statement {
  id: string;
  spent: number;
  deposited: number;
  keep: number;
  date: Date;
  startingBalance: number;
  accountId?: string;
  transactions?: Transaction[];
}
