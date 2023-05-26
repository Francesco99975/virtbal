export interface Transaction {
  id?: string;
  description: string;
  amount: number;
  isDeposit: boolean;
  date: string;
}

export interface EncryptedTransaction {
  id?: string;
  description: string;
  amount: string;
  isDeposit: boolean;
  date: string;
}
