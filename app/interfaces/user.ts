import { Account } from "./account";

export interface User {
  id: string;
  username: string;
  hashedPassword: string;
  accounts: Account[];
}
