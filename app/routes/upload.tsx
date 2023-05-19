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
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { authenticator } from "~/server/auth/auth.server";
import { getUserAccounts } from "~/server/fetch.server";
import { Account, BankLabels } from "~/interfaces/account";
import { useEffect, useState } from "react";
import { BoxItem, SelectBox } from "~/components/UI/SelectBox";
import { UploadedFile } from "~/interfaces/UploadedFile";

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
  const data = useActionData();

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
          className="flex flex-col items-center justify-center text-center w-fill m-5 h-[85vh]"
        >
          <h1 className="text-xl md:text-3xl mb-2 text-darkAccent dark:text-primary m-6">
            Upload Statement
          </h1>
          {data?.message && (
            <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg">
              {data.message}
            </span>
          )}
          <input
            type="hidden"
            name="account"
            id="account"
            value={selectedAccount.id}
          />
          <div className="w-3/4 md:w-2/4">
            <Input
              classnm="text-darkAccent dark:text-primary"
              classlabel="text-darkAccent dark:text-primary"
              id="file"
              label="Pick bank statement (PDF)"
              type="file"
            ></Input>
          </div>

          <div className="w-3/4 md:w-1/4 m-5">
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

          <div className="w-3/4">
            <Button
              type="submit"
              disabled={navigation.state === "submitting"}
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
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formCopy = request.clone();
  const file = await unstable_parseMultipartFormData(
    request,
    unstable_createFileUploadHandler({
      directory: path.resolve(__dirname, "upload"),
    }) // <-- we'll look at this deeper next
  );

  const data = await formCopy.formData();

  const accountId = data.get("account");
  const uploaded = file.get("file") as unknown as UploadedFile;

  if (!uploaded) return { message: "File not selected" };

  if (uploaded.type !== "application/pdf")
    return { message: "Only PDF file are accepted" };

  if (!accountId) return { message: "Account not selected" };

  const response = await parseTd(uploaded, accountId.toString());

  if (response.isError()) return response.error;

  return redirect("/");
}
