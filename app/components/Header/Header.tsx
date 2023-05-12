import { NavLink, useLocation, useNavigation } from "@remix-run/react";
import AddIcon from "../Icons/AddIcon";
import SunIcon from "../Icons/SunIcon";
import Button from "../UI/Button";
import { useContext } from "react";
import ThemeContext from "~/store/theme-context";
import MoonIcon from "../Icons/MoonIcon";
import ArrowLeft from "../Icons/ArrowLeft";

interface HeaderProps {
  balance: number;
}

export const Header = ({ balance }: HeaderProps) => {
  const { isDark, toggleDark } = useContext(ThemeContext);
  const location = useLocation();

  return (
    <header className="h-16 w-full flex justify-between items-center text-center p-2 bg-primary dark:bg-darkAccent text-accent dark:text-primary">
      <Button
        type="button"
        className="rounded-full m-3 w-4 p-0"
        onClick={toggleDark}
      >
        {isDark ? (
          <SunIcon classnm="text-yellow-500"></SunIcon>
        ) : (
          <MoonIcon classnm="text-blue-800"></MoonIcon>
        )}
      </Button>

      <span className="text-center text-xl md:text-3xl w-2/4">
        {balance >= 0 ? (
          `Virtual Balance - $${balance.toFixed(2)}`
        ) : (
          <span className="text-error">
            Virtual Balance - ${balance.toFixed(2)}
          </span>
        )}
      </span>

      {location?.pathname.includes("upload") ? (
        <NavLink to="/" className="rounded-full text-center m-3 w-4 p-0">
          <ArrowLeft classnm="text-accent"></ArrowLeft>
        </NavLink>
      ) : (
        <NavLink to="/upload" className="rounded-full text-center m-3 w-4 p-0">
          <AddIcon classnm="text-accent"></AddIcon>
        </NavLink>
      )}
    </header>
  );
};
