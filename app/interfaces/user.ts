import { Account } from "./account";

export interface User {
  id: string;
  username: string;
  password?: string;
  createdAt: Date;
  accounts?: Account[];
}
