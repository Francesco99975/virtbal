import { Result, failure, success } from "~/interfaces/Result";
import { ServerError } from "~/interfaces/serverError";
import { prisma } from "./db.server";
import { Account, PAYEE_TYPE } from "~/interfaces/account";
import { AuthorizationError } from "remix-auth";
import bcrypt from "bcrypt";
import { encryptData } from "./helpers/encrypt.server";
import { readKey } from "openpgp";

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

export async function updateAccountPayees(
  updaingIds: string[],
  updatingSelections: number[],
  newSelections: number[],
  newNames: string[],
  accountId: string,
  userId: string
): Promise<Result<ServerError, { code: number }>> {
  try {
    // Get Encryption Key

    const user = await prisma.users.findFirst({
      where: { id: userId },
      include: { publicKey: { select: { armored: true } } },
    });
    if (!user)
      return failure({ message: "User not found", error: null, code: 404 });
    if (!user.publicKey)
      return failure({ message: "Key not found", error: null, code: 404 });

    const key: string = user.publicKey.armored;
    const publicKey = await readKey({ armoredKey: key });

    if (newNames.length > 0) {
      for (let index = 0; index < newSelections.length; index++) {
        const encryptedName = await encryptData(newNames[index], publicKey);
        await prisma.payees.create({
          data: {
            name: encryptedName,
            type: newSelections[index],
            accountId,
          },
        });
      }
    }

    if (updaingIds.length > 0) {
      for (let index = 0; index < updaingIds.length; index++) {
        await prisma.payees.update({
          where: { id: updaingIds[index] },
          data: { type: updatingSelections[index] },
        });
      }
    }

    return success({ code: 201 });
  } catch (error) {
    console.log(error);
    return failure({
      message: "Could not update account payees",
      error,
      code: 403,
    });
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
