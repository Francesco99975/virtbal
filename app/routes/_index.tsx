import { ActionArgs, V2_MetaFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { StatementItem } from "~/components/Statement/StatementItem";
import Button from "~/components/UI/Button";
import { BoxItem, SelectBox } from "~/components/UI/SelectBox";
import { Account, BankLabels } from "~/interfaces/account";
import { Statement } from "~/interfaces/statement";
import { authenticator } from "~/server/auth/auth.server";
import { getUserAccounts } from "~/server/fetch.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Virtbal" }];
};

export async function loader({ request }: ActionArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return redirect("/statements");
}

export default function Index() {
  return <></>;
}
