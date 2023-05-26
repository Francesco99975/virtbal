import { PAYEE_TYPE } from "~/interfaces/account";
import { Transaction } from "~/interfaces/transaction";

interface TransactionItemProps {
  transaction: Transaction;
  type?: PAYEE_TYPE;
}

export const TransactionItem = ({
  transaction,
  type,
}: TransactionItemProps) => {
  return (
    <div
      className={
        "w-3/4 md:w-2/3 flex flex-col md:flex-row justify-between items-center p-2 m-2 rounded-md bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent" +
        (type === undefined
          ? ""
          : type === PAYEE_TYPE.RECURRING
          ? " border-8 border-error "
          : type === PAYEE_TYPE.ESSENTIAL
          ? " border-8 border-cyan-500 "
          : "")
      }
    >
      <div className="flex md:flex-col">
        <span className="m-2 text-sm md:text-lg">
          {transaction.description}
        </span>
        <span className="m-2 text-sm md:text:base hidden md:inline-block">
          {transaction.date}
        </span>
      </div>

      {transaction.isDeposit ? (
        <span className="text-accent">
          ${(transaction.amount / 100).toFixed(2)}
        </span>
      ) : (
        <span className="text-error">
          ${(transaction.amount / 100).toFixed(2)}
        </span>
      )}
    </div>
  );
};
