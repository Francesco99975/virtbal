import { PropsWithChildren, useState } from "react";
import StatementsContext from "./statements-context";
import { Statement } from "~/interfaces/statement";

const ThemeContextProvider = (props: PropsWithChildren<any>) => {
  const [statements, setStatements] = useState<Statement[]>([]);

  const addStatement = (statement: Statement) => {
    setStatements((state) => [...state, statement]);
  };

  return (
    <StatementsContext.Provider
      value={{
        statements,
        addStatement,
      }}
    >
      {props.children}
    </StatementsContext.Provider>
  );
};

export default ThemeContextProvider;
