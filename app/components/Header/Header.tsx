import { useContext } from "react";
import DropMenu from "../UI/DropMenu";
import GlobalValuesContext from "~/store/global-values-context";

export const Header = () => {
  const { keep: balance, username } = useContext(GlobalValuesContext);

  return (
    <header className="h-16 w-full flex justify-between items-center text-center p-2 bg-primary dark:bg-darkAccent text-accent dark:text-primary">
      <span className="text-center text-xl md:text-3xl w-2/4">
        {typeof balance === "number" && username ? (
          balance >= 0 && username.length > 0 ? (
            `${
              username.charAt(0).toUpperCase() + username.substring(1)
            }'s Keep - $${(balance / 100).toFixed(2)}`
          ) : (
            <span className="text-error">
              Virtual Balance - ${(balance / 100).toFixed(2)}
            </span>
          )
        ) : (
          "Virtbal - Track your savings"
        )}
      </span>

      <DropMenu isLoggedIn={typeof balance === "number"} />
    </header>
  );
};
