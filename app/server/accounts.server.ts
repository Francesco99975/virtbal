import { Result, failure, success } from "~/interfaces/Result";
import { ServerError } from "~/interfaces/serverError";
import { prisma } from "./db.server";

export interface AccountData {
  name: string;
  bank: number;
}

export async function addAccount(
  accountData: AccountData,
  userId: string
): Promise<Result<ServerError, { code: number }>> {
  try {
    await prisma.accounts.create({
      data: {
        name: accountData.name,
        bank: accountData.bank,
        userId,
      },
    });

    return success({ code: 201 });
  } catch (error) {
    return failure({ message: "Could not add account", error, code: 403 });
  }
}
