import { Form } from "@remix-run/react";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import Input from "../UI/Input";
import { RadioGroup } from "@headlessui/react";
import { useState } from "react";
import { PAYEE_TYPE } from "~/interfaces/account";
import Transaction from "~/interfaces/transaction";

interface PayeeSelectionProps {
  onBackdropClick: () => void;
  payees: Transaction[];
  accountId: string;
  essentialTransactions?: string[];
  recurringTransactions?: string[];
}

export const PayeeSelection = ({
  onBackdropClick,
  payees,
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
        onSubmit={() => {
          onBackdropClick();
        }}
        className="flex flex-col w-full p-6"
      >
        <h2 className="text-primary dark:text-darkAccent text-center text-xl md:text-2xl">
          Select how to track your payees
        </h2>
        <input type="hidden" name="action" value="selpayee" />
        <input type="hidden" name="id" value={accountId} />

        <div className="w-full flex flex-col items-center mt-3 p-1 h-[45vh] md:h-[55vh] whitespace-nowrap overflow-auto scrollbar-hide">
          {payeeSelection.map((selection: PAYEE_TYPE, index: number) => {
            return (
              <div
                className="w-full flex justify-center"
                key={index.toString()}
              >
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
