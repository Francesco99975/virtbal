import { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { StatementItem } from "~/components/Statement/StatementItem";
import { BoxItem, SelectBox } from "~/components/UI/SelectBox";
import { Account, BankLabels } from "~/interfaces/account";
import { Statement } from "~/interfaces/statement";
import { authenticator } from "~/server/auth/auth.server";
import { getUserAccounts } from "~/server/fetch.server";

export async function loader({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const result = await getUserAccounts(user.id);

  if (result.isError()) throw new Error("Server error on retreiving data");

  const accounts = result.value;

  return { accounts };
}

export default function Statements() {
  const { accounts } = useLoaderData() as unknown as { accounts: Account[] };
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const [statements, setStatements] = useState<Statement[]>([]);

  useEffect(() => {
    setSelectedAccount(accounts[0]);
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
      {accounts.length > 0 &&
      selectedAccount &&
      selectedAccount.statements.length > 0 ? (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row justify-center m-6 p-6">
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

          <div className="w-full flex flex-col items-center mt-3 p-1 h-[55vh] md:h-[70vh]">
            {statements.map((statement) => (
              <StatementItem key={statement.id} statement={statement} />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-[85vh] flex flex-col justify-center text-center items-center">
          <span className="text-darkAccent dark:text-primary text-2xl">
            {" "}
            No Statements yet. Add an{" "}
            <Link to="/accounts" className="text-accent">
              Account
            </Link>{" "}
            or a new{" "}
            <Link to="/upload" className="text-accent">
              Statement
            </Link>
          </span>
        </div>
      )}
    </>
  );
}
