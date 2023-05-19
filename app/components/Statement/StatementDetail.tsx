import { Statement } from "~/interfaces/statement";
import Transaction from "~/interfaces/transaction";
import { TransactionItem } from "./TransactionItem";
import Button from "../UI/Button";
import { Form } from "@remix-run/react";

interface StatementDetailProps {
  statement: Statement;
}

export const StatementDetail = ({ statement }: StatementDetailProps) => {
  return (
    <div className="w-full relative flex flex-col items-center justify-around h-[85vh] dark:text-primary text-darkAccent">
      <h2 className="text-lg md:text-xl p-2 rounded-sm m-6 text-center">
        {new Date(statement.date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}{" "}
        - Statement's Starting Balance:{" $"}
        {(statement.startingBalance / 100).toFixed(2)}
      </h2>

      <Form method="delete" className="md:absolute md:top-1 md:right-1">
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

      <h1 className="text-lg md:text-xl p-2 rounded-sm m-2 text-center">
        Transactions
      </h1>

      {!statement.transactions || statement.transactions.length <= 0 ? (
        <div className="w-3/4 md:w-2/3 flex justify-center items-center p-2 m-2 rounded-md bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent">
          <span>No Transactions</span>
        </div>
      ) : (
        <div className="flex flex-col w-3/4 md:w-2/3 items-center h-[55vh]  whitespace-nowrap overflow-auto scrollbar-hide">
          {statement.transactions.map((transaction: Transaction) => {
            return (
              <TransactionItem key={transaction.id} transaction={transaction} />
            );
          })}
        </div>
      )}
    </div>
  );
};
