import { Result, failure, success } from "~/interfaces/Result";
import { prisma } from "./db.server";
import { ServerError } from "~/interfaces/serverError";
import { Account } from "~/interfaces/account";
import { Statement } from "~/interfaces/statement";

export async function getUserAccounts(
  userId: string
): Promise<Result<ServerError, Account[]>> {
  try {
    return success(
      await prisma.accounts.findMany({
        where: { userId },
        include: {
          statements: {
            include: {
              transactions: true,
            },
          },
        },
      })
    );
  } catch (error) {
    return failure({ message: "Accounts not found", error, code: 404 });
  }
}

export async function getAccountStatements(
  accId: string
): Promise<Result<ServerError, Statement[]>> {
  try {
    const statements = await prisma.statements.findMany({
      include: {
        transactions: true,
      },
      where: {
        accountId: accId,
      },
    });
    return success(statements);
  } catch (error) {
    return failure({ message: "Statements not found", error, code: 404 });
  }
}
