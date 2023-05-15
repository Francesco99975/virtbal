import { Link, NavLink, useLocation, useNavigation } from "@remix-run/react";
import AddIcon from "../Icons/AddIcon";
import SunIcon from "../Icons/SunIcon";
import Button from "../UI/Button";
import { useContext } from "react";
import ThemeContext from "~/store/theme-context";
import MoonIcon from "../Icons/MoonIcon";
import ArrowLeft from "../Icons/ArrowLeft";
import { SelectBox } from "../UI/SelectBox";
import DropMenu from "../UI/DropMenu";

interface HeaderProps {
  balance?: number;
}

export const Header = ({ balance }: HeaderProps) => {
  const location = useLocation();

  return (
    <header className="h-16 w-full flex justify-between items-center text-center p-2 bg-primary dark:bg-darkAccent text-accent dark:text-primary">
      <span className="text-center text-xl md:text-3xl w-2/4">
        {balance ? (
          balance >= 0 ? (
            `Virtual Balance - $${balance.toFixed(2)}`
          ) : (
            <span className="text-error">
              Virtual Balance - ${balance.toFixed(2)}
            </span>
          )
        ) : (
          "Virtbal - Track your savings"
        )}
      </span>

      {location?.pathname.includes("upload") ? (
        <Link to="/" className="rounded-full text-center m-3 w-4 p-0">
          <ArrowLeft classnm="text-accent"></ArrowLeft>
        </Link>
      ) : (
        <DropMenu />
      )}
    </header>
  );
};
