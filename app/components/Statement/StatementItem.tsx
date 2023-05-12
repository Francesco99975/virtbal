import { Statement } from "~/interfaces/statement";

interface StatementItemProps {
  statement: Statement;
}

export const StatementItem = ({ statement }: StatementItemProps) => {
  return (
    <div className="bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent rounded-sm flex w-full h-5 justify-between items-center mb-2 p-2">
      <span className="font-bold">
        {statement.date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}
      </span>

      {statement.virtualRemainder >= 0 ? (
        <span className="italic text-accent">
          +{statement.virtualRemainder}
        </span>
      ) : (
        <span className="italic text-error">{statement.virtualRemainder}</span>
      )}
    </div>
  );
};
