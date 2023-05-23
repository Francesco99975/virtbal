import { Account, BankLabels } from "~/interfaces/account";
import Button from "../UI/Button";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { EditAccount } from "./EditAccount";
import { DeleteAccount } from "./DeleteAccount";

interface AccountItemProps {
  account: Account;
}

export const AccountItem = ({ account }: AccountItemProps) => {
  const [editModal, setEditModal] = useState(false);
  const [delModal, setDelModal] = useState(false);

  const handleDelModal = () => {
    setDelModal((state) => !state);
  };
  const handleEditModal = () => {
    setEditModal((state) => !state);
  };
  return (
    <>
      <div className="bg-darkAccent text-primary dark:bg-primary dark:text-darkAccent rounded-md flex w-3/4 md:w-1/3 h-5 justify-between items-center mb-2 p-6">
        <span className="flex w-1/3">
          <span className="rounded-full bg-primary dark:bg-darkAccent text-darkAccent dark:text-primary p-2 font-bold text-base">
            {BankLabels[account.bank].avatar}
          </span>
          <span className="ml-3 block truncate dark:text-darkAccent text-primary">
            {account.name}
          </span>
        </span>

        <div className="flex justify-around items-center w-1/2">
          <Button
            type="button"
            onClick={handleEditModal}
            className="p-2 rounded-sm text-center bg-blue-700"
          >
            <PencilSquareIcon
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            ></PencilSquareIcon>
          </Button>
          <Button
            type="button"
            onClick={handleDelModal}
            className="p-2 text-center rounded-sm bg-error"
          >
            <TrashIcon
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            ></TrashIcon>
          </Button>
        </div>
      </div>
      {editModal && (
        <EditAccount accountId={account.id} onBackdropClick={handleEditModal} />
      )}
      {delModal && (
        <DeleteAccount
          accountId={account.id}
          onBackdropClick={handleDelModal}
        />
      )}
    </>
  );
};
