import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { StatementDetail } from "~/components/Statement/StatementDetail";
import { Decrypting } from "~/components/UI/Decrypting";
import Loading from "~/components/UI/Loading";
import Modal from "~/components/UI/Modal";
import { decryptData } from "~/helpers/decrypt";
import { Result } from "~/interfaces/Result";
import { PAYEE_TYPE, Payee } from "~/interfaces/account";
import { Spending } from "~/interfaces/spending";
import { EncryptedStatement, Statement } from "~/interfaces/statement";
import { Transaction } from "~/interfaces/transaction";
import { updateAccountPayees } from "~/server/accounts.server";
import { authenticator } from "~/server/auth/auth.server";
import { getPayees, getStatement } from "~/server/fetch.server";
import { deleteStatement } from "~/server/upload.server";

export async function loader({ params, request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const id = params.statementId;
  if (!id) return redirect("/statements");

  const result = await getStatement(id);

  if (result.isError()) return redirect("/statements");

  const encryptedStatement = result.value;

  if (
    !encryptedStatement.transactions ||
    encryptedStatement.transactions.length <= 0 ||
    !encryptedStatement.accountId
  )
    return { encryptedStatement };

  const payeesResult = await getPayees(encryptedStatement.accountId);

  if (payeesResult.isError())
    return { encryptedStatement, username: user.username };

  const encryptedPayees = payeesResult.value;

  return { encryptedStatement, encryptedPayees, username: user.username };
}

export default function Statement() {
  const { encryptedStatement, encryptedPayees, username } =
    useLoaderData() as unknown as {
      encryptedStatement: EncryptedStatement;
      encryptedPayees: Payee[];
      username: string;
    };
  const data = useActionData();

  const [statement, setStatement] = useState<Statement>();
  const [spending, setSpending] = useState<Spending>();
  const [allPayees, setAllPayees] = useState<Payee[]>();
  const [loading, setLoading] = useState(true);

  const decryptStatement = async () => {
    try {
      const spent = +(await decryptData(encryptedStatement.spent, username));
      const deposited = +(await decryptData(
        encryptedStatement.deposited,
        username
      ));
      const keep = +(await decryptData(encryptedStatement.keep, username));

      const starting = +(await decryptData(
        encryptedStatement.startingBalance,
        username
      ));

      const decyptedTransactions: Transaction[] = [];
      if (encryptedStatement.transactions) {
        for (const encryptedTransaction of encryptedStatement.transactions) {
          const description = await decryptData(
            encryptedTransaction.description,
            username
          );

          const amount = +(await decryptData(
            encryptedTransaction.amount,
            username
          ));

          decyptedTransactions.push({
            id: encryptedTransaction.id,
            date: encryptedTransaction.date,
            isDeposit: encryptedTransaction.isDeposit,
            description,
            amount,
          });
        }
      }

      const decryptedStatement = {
        id: encryptedStatement.id,
        spent,
        deposited,
        keep,
        startingBalance: starting,
        date: encryptedStatement.date,
        accountId: encryptedStatement.accountId,
        transactions: decyptedTransactions,
      };

      setStatement(decryptedStatement);

      const decryptedPayees: Payee[] = [];
      if (encryptedPayees) {
        for (const encryptedPayee of encryptedPayees) {
          const name = await decryptData(encryptedPayee.name, username);
          decryptedPayees.push({
            id: encryptedPayee.id,
            type: encryptedPayee.type,
            name,
          });
        }

        setAllPayees(decryptedPayees);

        if (decryptedStatement && decryptedStatement.transactions) {
          const extra = decryptedStatement.transactions
            .filter((transaction) =>
              decryptedPayees
                .filter((payee) => payee.type == PAYEE_TYPE.EXTRA)
                .map((payee) => payee.name)
                .includes(transaction.description)
            )
            .reduce((prev, item) => prev + item.amount, 0);

          const essentialTransactions = decryptedStatement.transactions
            .filter((transaction) =>
              decryptedPayees
                .filter((payee) => payee.type == PAYEE_TYPE.ESSENTIAL)
                .map((payee) => payee.name)
                .includes(transaction.description)
            )
            .map((transaction) => transaction.id!);

          const recurringTransactions = decryptedStatement.transactions
            .filter((transaction) =>
              decryptedPayees
                .filter((payee) => payee.type == PAYEE_TYPE.RECURRING)
                .map((payee) => payee.name)
                .includes(transaction.description)
            )
            .map((transaction) => transaction.id!);

          const recurring = decryptedStatement.transactions
            .filter((transaction) =>
              decryptedPayees
                .filter((payee) => payee.type == PAYEE_TYPE.RECURRING)
                .map((payee) => payee.name)
                .includes(transaction.description)
            )
            .reduce((prev, item) => prev + item.amount, 0);

          const essential = decryptedStatement.transactions
            .filter((transaction) =>
              decryptedPayees
                .filter((payee) => payee.type == PAYEE_TYPE.ESSENTIAL)
                .map((payee) => payee.name)
                .includes(transaction.description)
            )
            .reduce((prev, item) => prev + item.amount, 0);

          setSpending({
            essential,
            essentialTransactions,
            extra,
            recurring,
            recurringTransactions,
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    decryptStatement();
  }, []);

  if (loading) {
    return <Decrypting />;
  }

  if (statement && spending && allPayees)
    return (
      <>
        <StatementDetail
          statement={statement}
          recurringCost={spending.recurring}
          essentialCost={spending.essential}
          extraCost={spending.extra}
          essentialTransactions={spending.essentialTransactions}
          recurringTransactions={spending.recurringTransactions}
          all={allPayees}
        />
      </>
    );

  if (statement) {
    return (
      <>
        <StatementDetail statement={statement} />
      </>
    );
  }
}

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const data = await request.formData();
  if (data.get("action")?.toString() === "delstt") {
    const rawId = data.get("statid");
    if (!rawId) return { message: "No Field Found" };

    const result = await deleteStatement(rawId.toString());

    if (result.isError()) return result.error;

    return redirect("/statements");
  }

  if (data.get("action")?.toString() === "selpayee") {
    const rawAccountId = data.get("id");
    if (!rawAccountId) return { message: "No Field Found" };
    const accountId = rawAccountId.toString();

    const rawNewLen = data.get("newlen");
    if (!rawNewLen) return { message: "No New Length Found" };

    const rawUpLen = data.get("uplen");
    if (!rawUpLen) return { message: "No Update Length Found" };

    const newLen = +rawNewLen.toString();
    const upLen = +rawUpLen.toString();

    const newPayeeNames: string[] = [];
    for (let index = 0; index < newLen; index++) {
      const x = data.get(`payeenmn${index.toString()}`)?.toString();

      if (x) newPayeeNames.push(x);
    }

    const newPayeeSelections: number[] = [];
    for (let index = 0; index < newLen; index++) {
      const x = data.get(`payseln${index.toString()}`)?.toString();

      if (x) newPayeeSelections.push(+x);
    }

    const updatingPayeeIds: string[] = [];
    for (let index = 0; index < upLen; index++) {
      const x = data.get(`payeenmid${index.toString()}`)?.toString();

      if (x) updatingPayeeIds.push(x);
    }

    const updatingPayeeSelections: number[] = [];
    for (let index = 0; index < upLen; index++) {
      const x = data.get(`payselu${index.toString()}`)?.toString();

      if (x) updatingPayeeSelections.push(+x);
    }

    if (!newPayeeNames && !updatingPayeeIds)
      return { message: "Fields not found" };

    if (newPayeeNames.length <= 0 && updatingPayeeIds.length <= 0)
      return { message: "Fields empty" };

    console.log(newPayeeNames);
    console.log(updatingPayeeIds);

    console.log(newPayeeSelections);
    console.log(updatingPayeeSelections);

    // Update account with selections
    const response = await updateAccountPayees(
      updatingPayeeIds || [],
      updatingPayeeSelections || [],
      newPayeeSelections || [],
      newPayeeNames || [],
      accountId,
      user.id
    );

    if (response.isError()) return response.error;

    // Return updated data to update client
    return { success: "Tracking Payees" };
  }
}
