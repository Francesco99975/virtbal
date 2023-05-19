import { Link } from "@remix-run/react";
import { Statement } from "~/interfaces/statement";

interface StatementItemProps {
  statement: Statement;
}

export const StatementItem = ({ statement }: StatementItemProps) => {
  return (
    <Link
      to={`/statements/${statement.id}`}
      className="bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent rounded-md flex w-3/4 md:w-1/3 h-5 justify-between items-center mb-2 p-6"
    >
      <span className="font-bold">
        {new Date(statement.date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}
      </span>

      {statement.keep >= 0 ? (
        <span className="italic text-accent">
          $+{(statement.keep / 100).toFixed(2)}
        </span>
      ) : (
        <span className="italic text-error">
          ${(statement.keep / 100).toFixed(2)}
        </span>
      )}
    </Link>
  );
};
