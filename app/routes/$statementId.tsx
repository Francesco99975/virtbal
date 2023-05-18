import { ActionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { StatementDetail } from "~/components/Statement/StatementDetail";
import { Statement } from "~/interfaces/statement";
import { authenticator } from "~/server/auth/auth.server";
import { getStatement } from "~/server/fetch.server";

export async function loader({ request }: ActionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const url = new URL(request.url);
  const id = url.searchParams.get("statementId");
  if (!id) return redirect("/");

  const result = await getStatement(id);

  if (result.isError()) throw new Error("Server error on retreiving data");

  const statement = result.value;

  return { statement };
}

export default function Statement() {
  const { statement } = useLoaderData() as unknown as { statement: Statement };

  return <StatementDetail statement={statement} />;
}
