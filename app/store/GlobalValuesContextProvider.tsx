import { PropsWithChildren, useState } from "react";
import GlobalValuesContext from "./global-values-context";

const GlobalValuesContextProvider = (props: PropsWithChildren<any>) => {
  const [keep, setKeep] = useState<number>(0);
  const [username, setUsername] = useState<string>("");

  const setCurrentKeep = (val: number) => {
    setKeep(val);
  };

  const setCurrentUsername = (val: string) => {
    setUsername(val);
  };

  return (
    <GlobalValuesContext.Provider
      value={{
        keep,
        username,
        setCurrentKeep,
        setCurrentUsername,
      }}
    >
      {props.children}
    </GlobalValuesContext.Provider>
  );
};

export default GlobalValuesContextProvider;
