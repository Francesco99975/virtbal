import {
  ActionArgs,
  redirect,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import Button from "~/components/UI/Button";
import Input from "~/components/UI/Input";
import Loading from "~/components/UI/Loading";
import { parseTd } from "~/server/upload";
import path from "path";
import { Form, useNavigation } from "@remix-run/react";

export default function Upload() {
  const navigation = useNavigation();

  return (
    <>
      <Form
        method="post"
        encType="multipart/form-data"
        className="flex flex-col items-center text-center w-full mb-5"
      >
        <div className=" w-3/4">
          <Input
            classnm="text-darkAccent dark:text-primary"
            classlabel="text-darkAccent dark:text-primary"
            id="file"
            label="Pick bank statement (PDF)"
            type="file"
          ></Input>
        </div>

        <div className=" w-3/4">
          <Button
            type="submit"
            className="dark:bg-primary dark:text-darkAccent bg-darkAccent text-primary w-1/2 "
          >
            Get Data
          </Button>
        </div>
      </Form>
      {navigation.state === "submitting" && <Loading />}
    </>
  );
}

export async function action({ request }: ActionArgs) {
  const data = await unstable_parseMultipartFormData(
    request,
    unstable_createFileUploadHandler({
      directory: path.resolve(__dirname, "upload"),
    }) // <-- we'll look at this deeper next
  );

  const filePath = data.get("file");

  if (!filePath) return;

  const response = await parseTd(filePath.toString());

  if (response.isError()) return;

  return redirect("/");
}
