import { BoxItem } from "~/components/UI/SelectBox";
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

export const BankLabels: BoxItem[] = [
  { id: "ze3WKn&", avatar: "TD", name: "TD Bank" },
  { id: "A?!8z7&", avatar: "TAN", name: "Tangerine Bank" },
  { id: "898C23r", avatar: "EQ", name: "EQ Bank" },
  { id: "B#bu45x", avatar: "RYB", name: "Royal Bank" },
  { id: "5%6DGW#", avatar: "SCT", name: "Scotia Bank" },
  { id: "7aDFEx?", avatar: "BMO", name: "Bank of Montreal" },
  { id: "7aD#B9K", avatar: "SMP", name: "Simplii Financial" },
  { id: "!qc#B9K", avatar: "CIB", name: "CIBC Bank" },
  { id: "@EYK@64", avatar: "IC", name: "IC Bank" },
];

export interface Account {
  id: string;
  name: string;
  bank: BANK;
  statements: Statement[];
}
