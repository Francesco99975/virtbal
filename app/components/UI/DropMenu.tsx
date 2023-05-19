import { Fragment, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { Form, NavLink } from "@remix-run/react";
import Button from "./Button";
import SunIcon from "../Icons/SunIcon";
import MoonIcon from "../Icons/MoonIcon";
import ThemeContext from "~/store/theme-context";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface DropMenuProps {
  isLoggedIn: boolean;
}

export default function DropMenu({ isLoggedIn }: DropMenuProps) {
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
                <button
                  type="button"
                  className="block px-4 py-2 text-sm"
                  onClick={toggleDark}
                >
                  {isDark ? (
                    <SunIcon classnm="text-yellow-500"></SunIcon>
                  ) : (
                    <MoonIcon classnm="text-blue-800"></MoonIcon>
                  )}
                </button>
              )}
            </Menu.Item>
            {isLoggedIn && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <NavLink
                      to="/statements"
                      // className={classNames(
                      //   active
                      //     ? "bg-accent text-darkAccent dark:bg-primary dark:text-accent"
                      //     : "text-primary dark:text-darkAccent",
                      //   "block px-4 py-2 text-sm"
                      // )}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-accent text-darkAccent dark:bg-primary dark:text-accent block px-4 py-2 text-sm"
                          : "text-primary dark:text-darkAccent block px-4 py-2 text-sm"
                      }
                    >
                      Statements
                    </NavLink>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <NavLink
                      to="/accounts"
                      className={({ isActive }) =>
                        isActive
                          ? "bg-accent text-darkAccent dark:bg-primary dark:text-accent block px-4 py-2 text-sm"
                          : "text-primary dark:text-darkAccent block px-4 py-2 text-sm"
                      }
                    >
                      Add Account
                    </NavLink>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <NavLink
                      to="/upload"
                      className={({ isActive }) =>
                        isActive
                          ? "bg-accent text-darkAccent dark:bg-primary dark:text-accent block px-4 py-2 text-sm"
                          : "text-primary dark:text-darkAccent block px-4 py-2 text-sm"
                      }
                    >
                      Upload Statement
                    </NavLink>
                  )}
                </Menu.Item>
                <Form method="post">
                  <input
                    type="hidden"
                    name="logout"
                    id="logout"
                    value="logout"
                  />
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
                </Form>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
