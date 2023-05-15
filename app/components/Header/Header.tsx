import DropMenu from "../UI/DropMenu";

interface HeaderProps {
  balance?: number | string;
}

export const Header = ({ balance }: HeaderProps) => {
  return (
    <header className="h-16 w-full flex justify-between items-center text-center p-2 bg-primary dark:bg-darkAccent text-accent dark:text-primary">
      <span className="text-center text-xl md:text-3xl w-2/4">
        {typeof balance === "number" ? (
          balance >= 0 ? (
            `Virtual Balance - $${(balance / 100).toFixed(2)}`
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
