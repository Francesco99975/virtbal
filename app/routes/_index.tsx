import { ActionArgs, V2_MetaFunction } from "@remix-run/node";
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
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const result = await getUserAccounts(user.id);

  const username = user.username;
  if (result.isError()) return { username, rawAccounts: "" };

  return { username, rawAccounts: JSON.stringify(result.value) };
}

export default function Index() {
  const { username, rawAccounts } = useLoaderData<typeof loader>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const [statements, setStatements] = useState<Statement[]>([]);

  useEffect(() => {
    console.log(username);
    const parsedData = JSON.parse(rawAccounts) as Account[];
    setAccounts(parsedData);
    setSelectedAccount(parsedData[0]);
    // setStatements(accounts[0].statements)
  }, []);

  useEffect(() => {
    if (selectedAccount) setStatements(selectedAccount.statements);
  }, [selectedAccount]);

  const handleSelection = (value: BoxItem) => {
    const account = accounts.find((account) => account.id === value.id);

    if (account) setSelectedAccount(account);
  };

  return (
    <>
      {accounts.length > 0 && selectedAccount ? (
        <div className="w-full md:w-3/4 h-[95vh] flex flex-col justify-center">
          <div className="w-full">
            <SelectBox
              contextName="Account"
              selectedItem={{
                id: selectedAccount.id,
                avatar: BankLabels[selectedAccount.bank].avatar,
                name: selectedAccount.name,
              }}
              items={accounts.map((account) => {
                return {
                  id: account.id,
                  avatar: BankLabels[account.bank].avatar,
                  name: account.name,
                };
              })}
              setSelectedItem={handleSelection}
            />
          </div>

          <div className="w-full h-[85vh] flex flex-col justify-center mt-2 p-1">
            {statements.map((statement) => (
              <StatementItem statement={statement} />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-[85vh] flex flex-col justify-center text-center items-center">
          <span className="text-darkAccent dark:text-primary text-2xl">
            {" "}
            No Statements yet. Add an{" "}
            <Link to="accounts" className="text-accent">
              Account
            </Link>{" "}
            or a new{" "}
            <Link to="upload" className="text-accent">
              Statement
            </Link>
          </span>
        </div>
      )}
    </>
  );
}
