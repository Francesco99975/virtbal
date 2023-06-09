import { Form, useSubmit } from "@remix-run/react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Input from "../UI/Input";

interface DeleteAccountProps {
  onBackdropClick: () => void;
  accountId: string;
}

export const DeleteAccount = ({
  onBackdropClick,
  accountId,
}: DeleteAccountProps) => {
  const submit = useSubmit();
  return (
    <Modal onClick={onBackdropClick}>
      <Form
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          if (!confirm("Are you sure?")) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          let $form = event.currentTarget;

          let formData = new FormData($form);

          onBackdropClick();
          submit(formData, {
            method: "post",
          });
        }}
        method="delete"
        className="flex flex-col w-full p-6"
      >
        <h2 className="text-error underline font-bold">Delete Account</h2>
        <input type="hidden" name="action" value="delacc" />
        <input type="hidden" name="id" value={accountId} />

        <Input
          type="password"
          label="Enter you password"
          id="password"
          classnm="dark:text-darkAccent text-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Button
          type="submit"
          className="p-2 bg-primary dark:bg-darkAccent text-error font-bold"
        >
          Delete Account
        </Button>
      </Form>
    </Modal>
  );
};
