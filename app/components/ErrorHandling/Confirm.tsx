import { useState } from "react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";

interface ConfirmProps {
  question: string;
  onBackdropClick: () => void;
  confirm: (state: boolean) => void;
}

export const Confirm = ({
  question,
  onBackdropClick,
  confirm,
}: ConfirmProps) => {
  return (
    <Modal onClick={onBackdropClick}>
      <div className="flex flex-col w-full p-6">
        <span className="text-lg md:text-xl text-primary dark:text-darkAccent m-2">
          {question}
        </span>

        <Button
          type="button"
          onClick={() => {
            confirm(true);
            onBackdropClick();
          }}
          className="p-2 bg-primary dark:bg-darkAccent text-darkAccent dark:text-primary"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export const useConfirmModal = () => {
  const [delmod, setDelmod] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const handleDeleteModal = () => {
    setDelmod((state) => !state);
  };

  return { delmod, isConfirmed, setIsConfirmed, handleDeleteModal };
};
