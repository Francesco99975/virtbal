import { PropsWithChildren, useEffect, useState } from "react";
import ThemeContext from "./theme-context";

const ThemeContextProvider = (props: PropsWithChildren<any>) => {
  const [isDark, setIsDark] = useState(false);

  const set = async () => {
    if (!localStorage.getItem("theme")) {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  };

  const toggleDark = () => {
    setIsDark((state) => {
      const newState = !state;
      if (newState) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.removeItem("theme");
      }
      return newState;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleDark,
        set,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
