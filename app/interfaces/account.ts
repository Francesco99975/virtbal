import { Statement } from "./statement";

export enum BANK {
  TD,
  TANGERINE,
  EQ,
  ROYAL,
  SCOTIA,
  BMO,
  SIMPLII,
  CIBC,
  IC,
}

export interface Account {
  id: string;
  name: string;
  bank: BANK;
  statements: Statement[];
  createdAt: Date;
}
