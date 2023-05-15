import { Fragment, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { Link } from "@remix-run/react";
import Button from "./Button";
import SunIcon from "../Icons/SunIcon";
import MoonIcon from "../Icons/MoonIcon";
import ThemeContext from "~/store/theme-context";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DropMenu() {
  const { isDark, toggleDark } = useContext(ThemeContext);
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="outline-none inline-flex w-full justify-center gap-x-1.5 rounded-md bg-darkAccent dark:bg-primary px-3 py-2 text-sm font-bold text-primary dark:text-darkAccent shadow-sm ring-1 ring-inset ring-gray-300">
          <AdjustmentsHorizontalIcon className="-mr-1 h-5 w-5 text-primary dark:text-accent" />
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-primary dark:text-accent"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-darkAccent dark:bg-primary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Button
                  type="button"
                  className={classNames(
                    active
                      ? "bg-accent text-darkAccent dark:bg-primary dark:text-accent"
                      : "text-primary dark:text-darkAccent",
                    "block px-4 py-2 text-sm"
                  )}
                  onClick={toggleDark}
                >
                  {isDark ? (
                    <SunIcon classnm="text-yellow-500"></SunIcon>
                  ) : (
                    <MoonIcon classnm="text-blue-800"></MoonIcon>
                  )}
                </Button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/accounts"
                  className={classNames(
                    active
                      ? "bg-accent text-darkAccent dark:bg-primary dark:text-accent"
                      : "text-primary dark:text-darkAccent",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  Add Account
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/upload"
                  className={classNames(
                    active
                      ? "bg-accent text-darkAccent dark:bg-primary dark:text-accent"
                      : "text-primary dark:text-darkAccent",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  Upload Statement
                </Link>
              )}
            </Menu.Item>
            <form method="POST" action="/logout">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="submit"
                    className={classNames(
                      active
                        ? "bg-error text-primary"
                        : "text-primary dark:text-darkAccent",
                      "block w-full px-4 py-2 text-left text-sm font-semibold"
                    )}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </form>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
