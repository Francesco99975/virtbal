import { createContext } from "react";
import { Statement } from "~/interfaces/statement";

export interface Statements {
  statements: Statement[];
  addStatement: (statement: Statement) => void;
}

const StatementsContext = createContext<Statements>({
  statements: [],
  addStatement: () => {},
});

export default StatementsContext;
