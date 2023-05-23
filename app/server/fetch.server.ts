import { Result, failure, success } from "~/interfaces/Result";
import { prisma } from "./db.server";
import { ServerError } from "~/interfaces/serverError";
import { Account, PAYEE_TYPE } from "~/interfaces/account";
import { Statement } from "~/interfaces/statement";
import { authenticator } from "./auth/auth.server";
import { ActionArgs } from "@remix-run/node";
import { logout } from "./auth/logout.server";
import Transaction from "~/interfaces/transaction";
import { Spending } from "~/interfaces/spending";

export async function getUserAccounts(
  userId: string
): Promise<Result<ServerError, Account[]>> {
  try {
    return success(
      await prisma.accounts.findMany({
        where: { userId },
        include: {
          statements: { orderBy: { date: "asc" } },
        },
      })
    );
  } catch (error) {
    return failure({ message: "Accounts not found", error, code: 404 });
  }
}

export async function getStatement(
  statementId: string
): Promise<Result<ServerError, Statement>> {
  try {
    const statement = await prisma.statements.findFirstOrThrow({
      where: { id: statementId },
      include: {
        transactions: true,
      },
    });

    return success(statement);
  } catch (error) {
    return failure({ message: "Statements not found", error, code: 404 });
  }
}

export async function getSpending(
  transactions: Transaction[],
  accountId: string
): Promise<Result<ServerError, Spending>> {
  try {
    const trackedPayees = await prisma.payees.findMany({
      where: { accountId },
      select: { name: true, type: true },
    });

    const extra = transactions
      .filter((transaction) =>
        trackedPayees
          .filter((payee) => payee.type == PAYEE_TYPE.EXTRA)
          .map((payee) => payee.name)
          .includes(transaction.description)
      )
      .reduce((prev, item) => prev + item.amount, 0);

    const essentialTransactions = transactions
      .filter((transaction) =>
        trackedPayees
          .filter((payee) => payee.type == PAYEE_TYPE.ESSENTIAL)
          .map((payee) => payee.name)
          .includes(transaction.description)
      )
      .map((transaction) => transaction.id!);

    const recurringTransactions = transactions
      .filter((transaction) =>
        trackedPayees
          .filter((payee) => payee.type == PAYEE_TYPE.RECURRING)
          .map((payee) => payee.name)
          .includes(transaction.description)
      )
      .map((transaction) => transaction.id!);

    const recurring = transactions
      .filter((transaction) =>
        trackedPayees
          .filter((payee) => payee.type == PAYEE_TYPE.RECURRING)
          .map((payee) => payee.name)
          .includes(transaction.description)
      )
      .reduce((prev, item) => prev + item.amount, 0);

    const essential = transactions
      .filter((transaction) =>
        trackedPayees
          .filter((payee) => payee.type == PAYEE_TYPE.ESSENTIAL)
          .map((payee) => payee.name)
          .includes(transaction.description)
      )
      .reduce((prev, item) => prev + item.amount, 0);

    return success({
      recurring,
      essential,
      extra,
      essentialTransactions,
      recurringTransactions,
    });
  } catch (error) {
    return failure({ message: "Could not verify spending", error, code: 404 });
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
