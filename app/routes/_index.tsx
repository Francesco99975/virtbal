import type { V2_MetaFunction } from "@remix-run/node";
import { useContext, useEffect } from "react";
import { StatementItem } from "~/components/Statement/StatementItem";
import Button from "~/components/UI/Button";
import { Statement } from "~/interfaces/statement";
import StatementsContext from "~/store/statements-context";
import ThemeContext from "~/store/theme-context";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Virtbal" }];
};

export default function Index() {
  const { statements, addStatement } = useContext(StatementsContext);

  return (
    <>
      {statements.length > 0 ? (
        <div className="w-full md:w-3/4 h-screen flex flex-col justify-center p-1">
          {statements.map((statement) => (
            <StatementItem statement={statement} />
          ))}
        </div>
      ) : (
        <div className="w-full h-screen flex flex-col justify-center text-center items-center">
          <span className="text-darkAccent dark:text-primary text-2xl">
            {" "}
            No Statements yet.
          </span>
          <Button
            type="button"
            className="bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent"
          >
            Add a new statement
          </Button>
        </div>
      )}
    </>
  );
}
