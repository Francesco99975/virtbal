export interface Spending {
  recurring: number;
  essential: number;
  extra: number;
  essentialTransactions: string[];
  recurringTransactions: string[];
}
