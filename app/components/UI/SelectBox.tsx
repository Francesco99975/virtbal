import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

export interface BoxItem {
  id: string;
  avatar: string;
  name: string;
}

interface SelectBoxProps {
  contextName?: string;
  selectedItem: BoxItem;
  items: BoxItem[];
  setSelectedItem: (value: BoxItem) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const SelectBox = ({
  contextName,
  selectedItem,
  items,
  setSelectedItem,
}: SelectBoxProps) => {
  return (
    <Listbox value={selectedItem} onChange={setSelectedItem}>
      {({ open }) => (
        <>
          {contextName && (
            <Listbox.Label className="block text-lg font-medium leading-6 text-accent dark:text-primary m-3">
              Select {contextName}
            </Listbox.Label>
          )}
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-darkAccent dark:bg-primary py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="flex items-center justify-between">
                <span className="rounded-full bg-primary dark:bg-darkAccent text-darkAccent dark:text-primary p-2 font-bold text-base">
                  {selectedItem.avatar}
                </span>
                <span className="ml-3 block truncate dark:text-darkAccent text-primary">
                  {selectedItem.name}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-darkAccent dark:bg-primary py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {items.map((item) => (
                  <Listbox.Option
                    key={item.id}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-accent text-primary" : "text-darkAccent",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-primary dark:bg-darkAccent text-darkAccent dark:text-primary p-2 font-bold text-base">
                            {item.avatar}
                          </span>
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate dark:text-darkAccent text-primary"
                            )}
                          >
                            {item.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active
                                ? "bg-accent text-primary"
                                : "text-darkAccent",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon
                              className="h-5 w-5 text-primary dark:text-darkAccent"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};
