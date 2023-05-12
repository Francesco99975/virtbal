export interface Statement {
  id: string;
  spent: number;
  deposited: number;
  virtualKeep: number;
  date: Date;
  startingBalance: number;
}
