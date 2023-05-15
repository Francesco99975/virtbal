export default interface Transaction {
  id?: string;
  description: string;
  amount: number;
  isDeposit: boolean;
  date: string;
}
