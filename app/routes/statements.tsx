import { Accounts } from "@prisma/client";
import { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { StatementItem } from "~/components/Statement/StatementItem";
import Loading from "~/components/UI/Loading";
import { BoxItem, SelectBox } from "~/components/UI/SelectBox";
import { decryptData } from "~/helpers/decrypt";
import { Account, BankLabels, EncryptedAccount } from "~/interfaces/account";
import { Statement } from "~/interfaces/statement";
import { Transaction } from "~/interfaces/transaction";
import { authenticator } from "~/server/auth/auth.server";
import {
  getUserAccounts,
  getUserAccountsWithStatements,
} from "~/server/fetch.server";

export async function loader({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const result = await getUserAccountsWithStatements(user.id);

  if (result.isError()) throw new Error("Server error on retreiving data");

  const encryptedAccounts = result.value;

  return { encryptedAccounts, username: user.username };
}

export default function Statements() {
  const { encryptedAccounts, username } = useLoaderData() as unknown as {
    encryptedAccounts: EncryptedAccount[];
    username: string;
  };

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  const decryptStatements = async () => {
    try {
      const decryptedAccounts: Account[] = [];
      for (const encryptedAccount of encryptedAccounts) {
        const decryptedStatements: Statement[] = [];

        if (encryptedAccount.statements) {
          const encryptedStatements = encryptedAccount.statements;

          for (const encryptedStatement of encryptedStatements) {
            const spent = +(await decryptData(
              encryptedStatement.spent,
              username
            ));
            const deposited = +(await decryptData(
              encryptedStatement.deposited,
              username
            ));
            const keep = +(await decryptData(
              encryptedStatement.keep,
              username
            ));

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

            decryptedStatements.push({
              id: encryptedStatement.id,
              spent,
              deposited,
              keep,
              startingBalance: starting,
              date: encryptedStatement.date,
              accountId: encryptedStatement.accountId,
              transactions: decyptedTransactions,
            });
          }
        }

        decryptedAccounts.push({
          id: encryptedAccount.id,
          bank: encryptedAccount.bank,
          name: encryptedAccount.name,
          statements: decryptedStatements,
        });
      }
      setAccounts(decryptedAccounts);
      setSelectedAccount(decryptedAccounts[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    decryptStatements();
  }, []);

  useEffect(() => {
    if (selectedAccount && selectedAccount.statements)
      setStatements(selectedAccount.statements);
  }, [selectedAccount]);

  const handleSelection = (value: BoxItem) => {
    const account = accounts.find((account) => account.id === value.id);

    if (account) setSelectedAccount(account);
  };

  return (
    <>
      {accounts.length > 0 &&
      selectedAccount &&
      selectedAccount.statements &&
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

          <div className="w-full flex flex-col items-center mt-3 p-1 h-[55vh] md:h-[70vh] whitespace-nowrap overflow-auto scrollbar-hide">
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
