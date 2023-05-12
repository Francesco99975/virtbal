export default interface Transaction {
  description: string;
  amount: number;
  isDeposit: boolean;
  date: string;
}
