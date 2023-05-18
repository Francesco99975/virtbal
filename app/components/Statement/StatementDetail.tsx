import { Statement } from "~/interfaces/statement";
import Transaction from "~/interfaces/transaction";
import { TransactionItem } from "./TransactionItem";

interface StatementDetailProps {
  statement: Statement;
}

export const StatementDetail = ({ statement }: StatementDetailProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-around text-primary dark:text-darkAccent">
      <h2 className="text-xl dark:bg-primary p-2 rounded-sm">
        {new Date(statement.date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}{" "}
        - Statement's Starting Balance: {statement.startingBalance}
      </h2>

      <span className="text-lg dark:bg-primary p-2 rounded-sm">
        Money Deposited: {statement.deposited}
      </span>
      <span className="text-lg dark:bg-primary p-2 rounded-sm">
        Money Spent: {statement.spent}
      </span>
      <span className="text-lg dark:bg-primary p-2 rounded-sm">
        Money Kept: {statement.keep}
      </span>

      {!statement.transactions || statement.transactions.length <= 0 ? (
        <div className="w-3/4 md:w-2/3 flex justify-center items-center p-2 m-2 rounded-md bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent">
          <span>No Transactions</span>
        </div>
      ) : (
        <div className="flex flex-col w-3/4 md:w-2/3 justify-center items-center h-[55vh] overflow-scroll">
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
