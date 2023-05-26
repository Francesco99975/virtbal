import { Form, useSubmit } from "@remix-run/react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Input from "../UI/Input";
import { RadioGroup } from "@headlessui/react";
import { useState } from "react";
import { PAYEE_TYPE, Payee } from "~/interfaces/account";
import { Transaction } from "~/interfaces/transaction";

interface PayeeSelectionProps {
  onBackdropClick: () => void;
  payees: Transaction[];
  all: Payee[];
  accountId: string;
  essentialTransactions?: string[];
  recurringTransactions?: string[];
}

export const PayeeSelection = ({
  onBackdropClick,
  payees,
  all,
  accountId,
  essentialTransactions,
  recurringTransactions,
}: PayeeSelectionProps) => {
  const [payeeSelection, setPayeeSelection] = useState(
    payees.map((payee) =>
      essentialTransactions?.includes(payee.id!)
        ? PAYEE_TYPE.ESSENTIAL
        : recurringTransactions?.includes(payee.id!)
        ? PAYEE_TYPE.RECURRING
        : PAYEE_TYPE.EXTRA
    )
  );

  const submit = useSubmit();
  const [clientErrorMessage, setClientErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      let $form = event.currentTarget;

      let formData = new FormData($form);

      const payeeIds = formData.getAll("payeeid").map((x) => x.toString());
      const payeeNames = formData.getAll("payeenm").map((x) => x.toString());
      const payeeSelections: number[] = [];

      for (let index = 0; index < payeeNames.length; index++) {
        const x = formData.get(`paysel${index.toString()}`)?.toString();

        if (x) payeeSelections.push(+x);
      }

      const updatingPayeeIds: string[] = [];
      const updatingPayeeSelections: number[] = [];

      payeeNames.filter((_, index) => {
        const changed =
          payeeIds[index] !== "newentry" &&
          payeeSelections[index] !==
            all.find((a) => a.id === payeeIds[index])?.type;
        if (changed) {
          updatingPayeeIds.push(payeeIds[index]);
          updatingPayeeSelections.push(payeeSelections[index]);
        }
        return changed;
      });

      const newPayeeSelections: number[] = [];

      const newPayeeNames = payeeNames.filter((payee, index) => {
        const isNew = !all.map((a) => a.name).includes(payee);
        if (isNew) newPayeeSelections.push(payeeSelections[index]);
        return isNew;
      });

      for (let index = 0; index < newPayeeNames.length; index++) {
        formData.set(`payeenmn${index.toString()}`, newPayeeNames[index]);
      }

      for (let index = 0; index < newPayeeSelections.length; index++) {
        formData.set(
          `payseln${index.toString()}`,
          payeeSelections[index].toString()
        );
      }

      for (let index = 0; index < updatingPayeeIds.length; index++) {
        formData.set(`payeenmid${index.toString()}`, updatingPayeeIds[index]);
      }

      for (let index = 0; index < updatingPayeeSelections.length; index++) {
        formData.set(
          `payselu${index.toString()}`,
          updatingPayeeSelections[index].toString()
        );
      }

      formData.set("newlen", newPayeeNames.length.toString());
      formData.set("uplen", updatingPayeeIds.length.toString());

      onBackdropClick();

      // console.log(newPayeeNames);
      // console.log(newPayeeSelections);
      // console.log(updatingPayeeIds);
      // console.log(updatingPayeeSelections);

      do {
        console.log(formData.keys().next().value);
      } while (formData.keys().next().done);

      submit(formData, {
        method: "post",
      });
    } catch (error) {
      console.log(error);
      setClientErrorMessage(
        "Something went wrong while generating encryption keys"
      );
    }
  };

  const handleSelection = (value: PAYEE_TYPE, index: number) => {
    setPayeeSelection((state) => {
      state[index] = value;
      return [...state];
    });
  };

  return (
    <Modal onClick={onBackdropClick}>
      <Form
        method="put"
        onSubmit={handleSubmit}
        className="flex flex-col w-full p-6"
      >
        <h2 className="text-primary dark:text-darkAccent text-center text-xl md:text-2xl">
          Select how to track your payees
        </h2>
        {clientErrorMessage && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg text-center">
            {clientErrorMessage}
          </span>
        )}
        <input type="hidden" name="action" value="selpayee" />
        <input type="hidden" name="id" value={accountId} />

        <div className="w-full flex flex-col items-center mt-3 p-1 h-[45vh] md:h-[55vh] whitespace-nowrap overflow-auto scrollbar-hide">
          {payeeSelection.map((selection: PAYEE_TYPE, index: number) => {
            const id =
              all.find((x) => x.name === payees[index].description)?.id ||
              "newentry";
            return (
              <div
                className="w-full flex justify-center"
                key={index.toString()}
              >
                <input
                  type="hidden"
                  id={"payeeid" + index.toString()}
                  name="payeeid"
                  value={id}
                />
                <input
                  type="hidden"
                  id={"payeenm" + index.toString()}
                  name="payeenm"
                  value={payees[index].description}
                />
                <RadioGroup
                  key={index.toString()}
                  className="dark:bg-darkAccent dark:text-primary bg-primary text-darkAccent rounded-md flex flex-col w-full md:w-2/3 text-center mb-2 p-6"
                  value={selection}
                  onChange={(value: PAYEE_TYPE) =>
                    handleSelection(value, index)
                  }
                  id={"paysel" + index.toString()}
                  name={"paysel" + index.toString()}
                >
                  <RadioGroup.Label className="font-bold text-center text-md md:text-xl m-2">
                    {payees[index].description}
                  </RadioGroup.Label>

                  <span className="font-bold text-center text-md md:text-xl m-2">
                    ${(payees[index].amount / 100).toFixed(2)}
                  </span>

                  <RadioGroup.Option
                    className="cursor-pointer rounded-lg p-2 bg-error border-2 border-error bg-opacity-30 ui-checked:font-bold ui-checked:bg-opacity-100 text-error ui-checked:text-primary m-2"
                    key={PAYEE_TYPE.RECURRING}
                    value={PAYEE_TYPE.RECURRING}
                    defaultChecked={recurringTransactions?.includes(
                      payees[index].id!
                    )}
                  >
                    Recurring Payment
                  </RadioGroup.Option>
                  <RadioGroup.Option
                    className="cursor-pointer rounded-lg p-2 bg-cyan-500 border-2 border-cyan-500 bg-opacity-30 ui-checked:font-bold ui-checked:bg-opacity-100 text-cyan-500 ui-checked:text-primary m-2"
                    key={PAYEE_TYPE.ESSENTIAL}
                    value={PAYEE_TYPE.ESSENTIAL}
                    defaultChecked={essentialTransactions?.includes(
                      payees[index].id!
                    )}
                  >
                    Essential Purchase
                  </RadioGroup.Option>
                  <RadioGroup.Option
                    className="cursor-pointer rounded-lg p-2 bg-orange-600 border-2 border-orange-600 bg-opacity-30 ui-checked:font-bold ui-checked:bg-opacity-100 text-orange-600 ui-checked:text-primary m-2"
                    key={PAYEE_TYPE.EXTRA}
                    value={PAYEE_TYPE.EXTRA}
                    defaultChecked={
                      !recurringTransactions?.includes(payees[index].id!) &&
                      !essentialTransactions?.includes(payees[index].id!)
                    }
                  >
                    Extra
                  </RadioGroup.Option>
                </RadioGroup>
              </div>
            );
          })}
        </div>

        <Button
          type="submit"
          className="mt-5 p-2 bg-primary dark:bg-darkAccent text-darkAccent dark:text-primary rounded-md"
        >
          Save Tracked Payees
        </Button>
      </Form>
    </Modal>
  );
};
