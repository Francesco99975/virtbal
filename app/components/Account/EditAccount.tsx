import { Form } from "@remix-run/react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Input from "../UI/Input";

interface EditAccountProps {
  onBackdropClick: () => void;
  accountId: string;
}

export const EditAccount = ({
  onBackdropClick,
  accountId,
}: EditAccountProps) => {
  return (
    <Modal onClick={onBackdropClick}>
      <Form className="flex flex-col w-full p-6">
        <h2 className="text-primary dark:text-darkAccent">
          Change Account Name
        </h2>
        <input type="hidden" name="action" value="updaccname" />
        <input type="hidden" name="id" value={accountId} />

        <Input
          type="text"
          label="New Account Name"
          id="naccname"
          classnm="dark:text-darkAccent text-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Button
          type="submit"
          className="p-2 bg-primary dark:bg-darkAccent text-darkAccent dark:text-primary"
        >
          Update Account Name
        </Button>
      </Form>
    </Modal>
  );
};
