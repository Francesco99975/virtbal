import { createContext } from "react";
import { Statement } from "~/interfaces/statement";

export interface GVals {
  keep: number;
  username: string;
  setCurrentKeep: (val: number) => void;
  setCurrentUsername: (val: string) => void;
}

const GlobalValuesContext = createContext<GVals>({
  keep: 0,
  username: "",
  setCurrentKeep: () => {},
  setCurrentUsername: () => {},
});

export default GlobalValuesContext;
