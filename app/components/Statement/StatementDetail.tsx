import { Statement } from "~/interfaces/statement";
import { Transaction } from "~/interfaces/transaction";
import { TransactionItem } from "./TransactionItem";
import Button from "../UI/Button";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { PayeeSelection } from "./PayeeSelection";
import { PAYEE_TYPE, Payee } from "~/interfaces/account";

interface StatementDetailProps {
  statement: Statement;
  recurringCost?: number;
  essentialCost?: number;
  extraCost?: number;
  essentialTransactions?: string[];
  recurringTransactions?: string[];
  all?: Payee[];
}

export const StatementDetail = ({
  statement,
  recurringCost,
  essentialCost,
  extraCost,
  essentialTransactions,
  recurringTransactions,
  all,
}: StatementDetailProps) => {
  const [payeeModalOpen, SetPayeeModalOpen] = useState(false);

  const handlePayeeModalOpen = () => {
    SetPayeeModalOpen((state) => !state);
  };

  return (
    <>
      <div className="w-full relative flex flex-col items-center justify-around h-[85vh] dark:text-primary text-darkAccent">
        <h2 className="text-lg md:text-xl p-2 rounded-sm m-6 text-center">
          {new Date(statement.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}{" "}
          - Statement's Starting Balance:{" $"}
          {(statement.startingBalance / 100).toFixed(2)}
        </h2>

        <Button
          type="button"
          onClick={handlePayeeModalOpen}
          className="p-2 m-2 bg-darkAccent text-primary rounded-sm md:absolute md:top-1 md:left-1"
        >
          Track Payees
        </Button>

        <Form
          method="delete"
          onSubmit={(event) => {
            if (!confirm("Are you sure?")) {
              event.preventDefault();
            }
          }}
          className="md:absolute md:top-1 md:right-1"
        >
          <input type="hidden" name="action" id="action" value="delstt" />
          <input type="hidden" name="statid" id="statid" value={statement.id} />
          <Button
            type="submit"
            className="p-2 m-2 bg-error text-primary rounded-sm"
          >
            Delete Statement
          </Button>
        </Form>

        <span className="text-sm md:text-lg m-1">
          Money Deposited: ${(statement.deposited / 100).toFixed(2)}
        </span>
        <span className="text-sm md:text-lg m-1">
          Money Spent: ${(statement.spent / 100).toFixed(2)}
        </span>
        <span className="text-sm md:text-lg m-1">
          Money Kept: ${(statement.keep / 100).toFixed(2)}
        </span>

        {recurringCost != undefined && recurringCost > 0 && (
          <span className="text-sm md:text-lg m-1">
            Recurring Cost: ${(recurringCost / 100).toFixed(2)}
          </span>
        )}

        {essentialCost != undefined && essentialCost > 0 && (
          <span className="text-sm md:text-lg m-1">
            Essential Cost: ${(essentialCost / 100).toFixed(2)}
          </span>
        )}

        {extraCost != undefined && extraCost > 0 && (
          <span className="text-sm md:text-lg m-1">
            Extra Cost: ${(extraCost / 100).toFixed(2)}
          </span>
        )}

        <h1 className="text-lg md:text-xl p-2 rounded-sm m-2 text-center">
          Transactions
        </h1>

        {!statement.transactions || statement.transactions.length <= 0 ? (
          <div className="w-3/4 md:w-2/3 flex justify-center items-center p-2 m-2 rounded-md bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent">
            <span>No Transactions</span>
          </div>
        ) : (
          <div className="flex flex-col w-3/4 md:w-2/3 items-center h-[55vh] whitespace-nowrap overflow-auto scrollbar-hide">
            {statement.transactions.map((transaction: Transaction) => {
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  type={
                    essentialTransactions?.includes(transaction.id!)
                      ? PAYEE_TYPE.ESSENTIAL
                      : recurringTransactions?.includes(transaction.id!)
                      ? PAYEE_TYPE.RECURRING
                      : PAYEE_TYPE.EXTRA
                  }
                />
              );
            })}
          </div>
        )}
      </div>
      {payeeModalOpen &&
        statement.transactions &&
        statement.accountId &&
        statement.transactions.length >= 0 && (
          <PayeeSelection
            onBackdropClick={handlePayeeModalOpen}
            payees={statement.transactions
              .filter((transaction) => !transaction.isDeposit)
              .reduce(
                (arr, cur) => {
                  if (
                    !arr.map((o) => o.description).includes(cur.description)
                  ) {
                    arr.push(cur);
                  }
                  return arr;
                },
                [
                  statement.transactions.filter(
                    (transaction) => !transaction.isDeposit
                  )[0],
                ]
              )}
            accountId={statement.accountId}
            essentialTransactions={essentialTransactions}
            recurringTransactions={recurringTransactions}
            all={all || []}
          />
        )}
    </>
  );
};
