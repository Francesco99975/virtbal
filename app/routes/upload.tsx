import {
  ActionArgs,
  redirect,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import Button from "~/components/UI/Button";
import Input from "~/components/UI/Input";
import Loading from "~/components/UI/Loading";
import { parseTd } from "~/server/upload.server";
import path from "path";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { authenticator } from "~/server/auth/auth.server";
import { getUserAccounts } from "~/server/fetch.server";
import { Account, BankLabels } from "~/interfaces/account";
import { useEffect, useState } from "react";
import { BoxItem, SelectBox } from "~/components/UI/SelectBox";

export async function loader({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const result = await getUserAccounts(user.id);

  if (result.isError()) return redirect("/accounts");

  if (result.value.length === 0) return redirect("/accounts");

  return { rawAccounts: JSON.stringify(result.value) };
}

export default function Upload() {
  const navigation = useNavigation();

  const { rawAccounts } = useLoaderData();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account>();

  useEffect(() => {
    const parsedData = JSON.parse(rawAccounts) as Account[];
    setAccounts(parsedData);
    setSelectedAccount(parsedData[0]);
  }, []);

  const handleSelection = (value: BoxItem) => {
    const account = accounts.find((account) => account.id === value.id);

    if (account) setSelectedAccount(account);
  };

  return (
    <>
      {selectedAccount && (
        <Form
          method="post"
          encType="multipart/form-data"
          className="flex flex-col items-center text-center w-fill mb-5"
        >
          <h1 className="text-xl md:text-3xl mb-2">Upload Statement</h1>

          <div className="w-3/4">
            <Input
              classnm="text-darkAccent dark:text-primary"
              classlabel="text-darkAccent dark:text-primary"
              id="file"
              label="Pick bank statement (PDF)"
              type="file"
            ></Input>
          </div>

          <input type="hidden" name="account" value={selectedAccount.id} />

          <div className="w-3/4">
            <SelectBox
              selectedItem={{
                id: selectedAccount.id,
                avatar: BankLabels[selectedAccount.bank].avatar,
                name: selectedAccount.name,
              }}
              items={accounts.map((account) => {
                return {
                  id: account.id,
                  avatar: BankLabels[account.bank].avatar,
                  name: account.name,
                };
              })}
              setSelectedItem={handleSelection}
            />
          </div>

          <div className=" w-3/4">
            <Button
              type="submit"
              className="dark:bg-primary dark:text-darkAccent bg-darkAccent text-primary w-1/2 "
            >
              Upload File
            </Button>
          </div>
        </Form>
      )}

      {(navigation.state === "submitting" || !selectedAccount) && <Loading />}
    </>
  );
}

export async function action({ request }: ActionArgs) {
  const data = await request.formData();
  const file = await unstable_parseMultipartFormData(
    request,
    unstable_createFileUploadHandler({
      directory: path.resolve(__dirname, "upload"),
    }) // <-- we'll look at this deeper next
  );

  const accountId = data.get("account");
  const filePath = file.get("file");

  if (!filePath || !accountId) return;

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const response = await parseTd(
    filePath.toString(),
    user.id,
    accountId.toString()
  );

  if (response.isError()) return;

  return redirect("/");
}
