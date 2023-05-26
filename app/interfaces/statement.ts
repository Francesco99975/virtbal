import { Transaction, EncryptedTransaction } from "./transaction";

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

export interface EncryptedStatement {
  id: string;
  spent: string;
  deposited: string;
  keep: string;
  date: Date;
  startingBalance: string;
  accountId?: string;
  transactions?: EncryptedTransaction[];
}
