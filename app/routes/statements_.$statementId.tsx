import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { StatementDetail } from "~/components/Statement/StatementDetail";
import { Statement } from "~/interfaces/statement";
import { authenticator } from "~/server/auth/auth.server";
import { getStatement } from "~/server/fetch.server";
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

  return { statement };
}

export default function Statement() {
  const { statement } = useLoaderData() as unknown as { statement: Statement };

  return <StatementDetail statement={statement} />;
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
}
