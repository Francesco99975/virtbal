import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { StatementDetail } from "~/components/Statement/StatementDetail";
import { Result } from "~/interfaces/Result";
import { ServerError } from "~/interfaces/serverError";
import { Spending } from "~/interfaces/spending";
import { Statement } from "~/interfaces/statement";
import { updateAccountPayees } from "~/server/accounts.server";
import { authenticator } from "~/server/auth/auth.server";
import { getSpending, getStatement } from "~/server/fetch.server";
import { deleteStatement } from "~/server/upload.server";

export async function loader({ params, request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const id = params.statementId;
  if (!id) return redirect("/statements");

  const result = await getStatement(id);

  if (result.isError()) return redirect("/statements");

  const statement = result.value;

  if (
    !statement.transactions ||
    statement.transactions.length <= 0 ||
    !statement.accountId
  )
    return { statement };

  const spendingResult = await getSpending(
    statement.transactions.filter((transaction) => !transaction.isDeposit),
    statement.accountId
  );

  if (spendingResult.isError()) return { statement };

  const spending = spendingResult.value;

  return { statement, spending };
}

export default function Statement() {
  const { statement, spending } = useLoaderData() as unknown as {
    statement: Statement;
    spending: Spending;
  };

  if (!spending) return <StatementDetail statement={statement} />;
  return (
    <StatementDetail
      statement={statement}
      recurringCost={spending.recurring}
      essentialCost={spending.essential}
      extraCost={spending.extra}
      essentialTransactions={spending.essentialTransactions}
      recurringTransactions={spending.recurringTransactions}
    />
  );
}

export async function action({ request }: ActionArgs) {
  await authenticator.isAuthenticated(request, {
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
    const rawId = data.get("id");
    if (!rawId) return { message: "No Field Found" };

    const id = rawId.toString();
    const payeeNames = data.getAll("payeenm").map((x) => x.toString());
    const payeeSelections: number[] = [];

    for (let index = 0; index < payeeNames.length; index++) {
      const x = data.get(`paysel${index.toString()}`)?.toString();

      if (x) payeeSelections.push(+x);
    }

    // Update account with selections
    const response = await updateAccountPayees(payeeSelections, payeeNames, id);

    if (response.isError()) return { message: "Could not add tracked payees" };

    return { success: "Tracking Payees" };
  }
}
