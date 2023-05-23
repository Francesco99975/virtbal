import { BoxItem, SelectBox } from "~/components/UI/SelectBox";
import { Account, BankLabels } from "~/interfaces/account";
import { useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import Input from "~/components/UI/Input";
import Button from "~/components/UI/Button";
import Loading from "~/components/UI/Loading";
import { ActionArgs, redirect } from "@remix-run/node";
import {
  addAccount,
  deleteAccount,
  updateAccountName,
} from "~/server/accounts.server";
import { authenticator } from "~/server/auth/auth.server";
import { getUserAccounts } from "~/server/fetch.server";
import { AccountItem } from "~/components/Account/AccountItem";

export async function loader({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const result = await getUserAccounts(user.id);

  if (result.isError()) throw new Error("Server error on retreiving data");

  const accounts = result.value;

  return { accounts };
}

export default function Accounts() {
  const { accounts } = useLoaderData() as unknown as { accounts: Account[] };
  const navigation = useNavigation();
  const [selectedBank, setSelectedBank] = useState<BoxItem>(BankLabels[0]);
  const data = useActionData();

  const handleSelection = (value: BoxItem) => {
    setSelectedBank(value);
  };

  return (
    <div className="flex flex-col justify-center items-center text-center w-full h-[85vh]">
      <Form
        method="post"
        className="flex flex-col justify-center items-center text-center w-full mb-5"
      >
        <h1 className="text-xl md:text-3xl mb-2 text-darkAccent dark:text-primary m-6">
          Add New Bank Account
        </h1>
        {data?.message && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg">
            {data.message}
          </span>
        )}
        <input type="hidden" name="action" value="addacc" />
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

      {accounts.length > 0 && (
        <div className="w-full flex flex-col items-center mt-3 p-1 h-[55vh] md:h-[70vh] whitespace-nowrap overflow-auto scrollbar-hide">
          {accounts.map((account) => (
            <AccountItem key={account.id} account={account} />
          ))}
        </div>
      )}
      {navigation.state === "submitting" && <Loading />}
    </div>
  );
}
export async function action({ request }: ActionArgs) {
  const data = await request.formData();

  if (data.get("action")?.toString() === "addacc") {
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

    if (response.isError()) response.error;

    return redirect("/upload");
  }

  if (data.get("action")?.toString() === "updaccname") {
    const rawName = data.get("naccname");
    const rawId = data.get("id");

    if (!rawName || !rawId) return { message: "Invalid Data" };

    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });

    const accountInfo = {
      name: rawName.toString().trim(),
      id: rawId.toString(),
    };

    if (accountInfo.name.length > 12) {
      return { message: "Invalid account name. Must not exeed 12 characters" };
    }

    const response = await updateAccountName(accountInfo.id, accountInfo.name);

    if (response.isError()) response.error;

    return redirect("/accounts");
  }

  if (data.get("action")?.toString() === "delacc") {
    const rawPassword = data.get("password");
    const rawId = data.get("id");

    if (!rawPassword || !rawId) return { message: "Invalid Data" };

    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });

    const accountInfo = {
      password: rawPassword.toString().trim(),
      id: rawId.toString(),
    };

    const response = await deleteAccount(
      accountInfo.id,
      accountInfo.password,
      user.id
    );

    if (response.isError()) response.error;

    return redirect("/accounts");
  }
}
