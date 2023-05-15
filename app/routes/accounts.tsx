import { BoxItem, SelectBox } from "~/components/UI/SelectBox";
import { BankLabels } from "~/interfaces/account";
import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import Input from "~/components/UI/Input";
import Button from "~/components/UI/Button";
import Loading from "~/components/UI/Loading";
import { ActionArgs, redirect } from "@remix-run/node";
import { addAccount } from "~/server/accounts.server";
import { authenticator } from "~/server/auth/auth.server";

export default function Accounts() {
  const navigation = useNavigation();
  const [selectedBank, setSelectedBank] = useState<BoxItem>(BankLabels[0]);
  const data = useActionData();

  const handleSelection = (value: BoxItem) => {
    setSelectedBank(value);
  };

  return (
    <>
      <Form
        method="post"
        className="flex flex-col justify-center items-center text-center w-full mb-5 h-[85vh]"
      >
        <h1 className="text-xl md:text-3xl mb-2 text-darkAccent dark:text-primary m-6">
          Add New Bank Account
        </h1>
        {data?.message && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg">
            {data.message}
          </span>
        )}
        <div className="w-3/4 md:w-2/4">
          <Input
            classnm="text-darkAccent dark:text-primary border-b-primary dark:border-b-darkAccent"
            classlabel="text-darkAccent dark:text-primary"
            id="name"
            label="Enter a name for this account"
            type="text"
          ></Input>
        </div>

        <input
          type="hidden"
          name="bank"
          value={BankLabels.findIndex((lb) => lb.id === selectedBank.id)}
        />

        <div className="w-3/4 md:w-1/4 m-5">
          <SelectBox
            contextName="Bank"
            selectedItem={selectedBank}
            items={BankLabels}
            setSelectedItem={handleSelection}
          ></SelectBox>
        </div>

        <div className="w-3/4">
          <Button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="dark:bg-primary dark:text-darkAccent bg-darkAccent text-primary w-1/2 "
          >
            Add Account
          </Button>
        </div>
      </Form>
      {navigation.state === "submitting" && <Loading />}
    </>
  );
}
export async function action({ request }: ActionArgs) {
  const data = await request.formData();

  const rawName = data.get("name");
  const rawBank = data.get("bank");

  if (!rawName || !rawBank) return { message: "Invalid Data" };

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const accountInfo = {
    name: rawName.toString().trim(),
    bank: +rawBank.toString(),
  };

  if (accountInfo.name.length > 12) {
    return { message: "Invalid account name. Must not exeed 12 characters" };
  }

  const response = await addAccount(accountInfo, user.id);

  if (response.isError()) {
    return {
      message: "Server Error. Account could not be added",
      error: response.error,
    };
  }

  return redirect("/upload");
}