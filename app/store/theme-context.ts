import { createContext } from "react";

export interface Theme {
  isDark: boolean;
  toggleDark: () => void;
  set: () => void;
}

const ThemeContext = createContext<Theme>({
  isDark: false,
  toggleDark: () => {},
  set: () => {},
});

export default ThemeContext;
