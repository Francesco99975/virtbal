import { Result, failure, success } from "~/interfaces/Result";
import { ServerError } from "~/interfaces/serverError";
import { prisma } from "./db.server";
import { Account } from "~/interfaces/account";
import { AuthorizationError } from "remix-auth";
import bcrypt from "bcrypt";

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

export async function updateAccountName(
  accountId: string,
  newName: string
): Promise<Result<ServerError, Account>> {
  try {
    const account = await prisma.accounts.findFirst({
      where: { id: accountId },
    });

    if (!account)
      return failure({ message: "Account not found", error: null, code: 404 });

    const nameExists =
      (
        await prisma.accounts.findMany({
          where: { id: accountId, name: newName },
        })
      ).length > 0;

    if (nameExists)
      return failure({
        message: "This name is already in use",
        code: 401,
        error: null,
      });

    const updatedAccount = await prisma.accounts.update({
      where: { id: accountId },
      data: { name: newName },
    });

    return success(updatedAccount);
  } catch (error) {
    return failure({
      message: "Could not update account name",
      error,
      code: 403,
    });
  }
}

export async function deleteAccount(
  accountId: string,
  password: string,
  userId: string
): Promise<Result<ServerError, Account>> {
  try {
    const account = await prisma.accounts.findFirst({
      where: { id: accountId },
    });

    if (!account)
      return failure({ message: "Account not found", error: null, code: 404 });

    const user = await prisma.users.findFirst({
      where: { id: userId },
      include: {
        password: true,
      },
    });

    if (!user || !user.password) throw new AuthorizationError("User not found");

    const passwordsMatch = await bcrypt.compare(password, user.password.hash);

    if (!passwordsMatch)
      return failure({
        message: "Wrong password",
        code: 401,
        error: null,
      });

    const deletedAccount = await prisma.accounts.delete({
      where: { id: accountId },
    });

    return success(deletedAccount);
  } catch (error) {
    return failure({
      message: "Could not update account name",
      error,
      code: 403,
    });
  }
}
