import { Result, failure, success } from "~/interfaces/Result";
import { prisma } from "./db.server";
import { ServerError } from "~/interfaces/serverError";
import { Account } from "~/interfaces/account";
import { Statement } from "~/interfaces/statement";
import { authenticator } from "./auth/auth.server";
import { ActionArgs, redirect } from "@remix-run/node";
import { logout } from "./auth/logout.server";

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

export async function getVirtualKeep(
  args: ActionArgs,
  accountId?: string
): Promise<Result<ServerError, number>> {
  try {
    const loggedUser = await authenticator.isAuthenticated(args.request, {
      failureRedirect: "/login",
    });

    if (!loggedUser) throw Error("Not Logged in");

    const user = await prisma.users.findFirst({
      where: { id: loggedUser.id },
      include: { accounts: true },
    });

    if (!user) {
      await logout(args);
      throw Error("User not found");
    }

    if (user.accounts.length <= 0) return success(0);

    const statements = await prisma.statements.findMany({
      where: {
        accountId: accountId || user.accounts[0].id,
      },
    });

    if (statements.length <= 0) return success(0);

    const currentKeep = statements.reduce(
      (prev, currentItem) => prev + currentItem.keep,
      0
    );
    return success(currentKeep);
  } catch (error) {
    console.log(error);
    return failure({ message: "Could not calculate keep", error, code: 500 });
  }
}
