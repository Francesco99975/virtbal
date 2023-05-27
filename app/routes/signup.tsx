import { ActionArgs, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import Button from "~/components/UI/Button";
import Input from "~/components/UI/Input";
import Loading from "~/components/UI/Loading";
import { generateKeys } from "~/helpers/generateKeys";
import { authenticator } from "~/server/auth/auth.server";
import { signup } from "~/server/auth/signup.server";
import GlobalValuesContext from "~/store/global-values-context";

export async function loader({ request }: ActionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function SignUp() {
  const navigation = useNavigation();
  const data = useActionData();
  const [clientErrorMessage, setClientErrorMessage] = useState("");
  const submit = useSubmit();

  const { setCurrentKeep, setCurrentUsername } =
    useContext(GlobalValuesContext);

  useEffect(() => {
    setCurrentKeep(0);
    setCurrentUsername("");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      let $form = event.currentTarget;

      let formData = new FormData($form);

      const username = (formData.get("username") as string)
        .replace(/ /g, "")
        .toLowerCase();
      const password = (formData.get("password") as string).replace(/ /g, "");
      const confirm = (formData.get("confirm") as string).replace(/ /g, "");

      if (!username || !password || !confirm) {
        setClientErrorMessage("Form is incomplete. Fill every field correctly");
        return;
      }

      if (username.length > 12)
        setClientErrorMessage(
          "Username too long. Must be less than 12 characters"
        );

      if (username.length <= 0 || password.length <= 0 || confirm.length <= 0)
        setClientErrorMessage("Form is incomplete. Fill every field correctly");

      if (password !== confirm) setClientErrorMessage("Passwords don't match");

      const publicKey = await generateKeys(username);

      formData.set("key", publicKey);

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

  return (
    <div className="flex justify-center items-center w-full h-[85vh]">
      <Form
        method="post"
        onSubmit={handleSubmit}
        className="flex flex-col w-3/4 md:w-1/3 justify-between items-center rounded-md bg-darkAccent dark:bg-primary p-5"
      >
        <h1 className="text-xl md:text-3xl dark:text-accent text-primary">
          Sign Up
        </h1>
        {data?.message && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg text-center">
            {data.message}
          </span>
        )}
        {clientErrorMessage && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg text-center">
            {clientErrorMessage}
          </span>
        )}
        <Input
          id="username"
          label="Username"
          type="text"
          classnm="dark:text-darkAccent text-primary border-b-primary dark:border-b-darkAccent"
          classlabel="dark:text-darkAccent text-primary"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          classnm="dark:text-darkAccent text-primary border-b-primary dark:border-b-darkAccent"
          classlabel="dark:text-darkAccent text-primary"
        />
        <Input
          id="confirm"
          label="Confirm Password"
          type="password"
          classnm="dark:text-darkAccent text-primary border-b-primary dark:border-b-darkAccent"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="bg-primary text-accent dark:bg-darkAccent dark:text-primary w-2/4 mt-3"
        >
          Signup
        </Button>

        <Link
          to="/login"
          className="text-lg text-primary dark:text-accent mt-6 text-center"
        >
          I already have an account
        </Link>
      </Form>
      {navigation.state === "submitting" && <Loading />}
    </div>
  );
}

export async function action({ request }: ActionArgs) {
  const form = await request.formData();

  const username = (form.get("username") as string)
    .replace(/ /g, "")
    .toLowerCase();
  const password = (form.get("password") as string).replace(/ /g, "");
  const confirm = (form.get("confirm") as string).replace(/ /g, "");
  const key = form.get("key") as string;

  if (username.length > 12)
    return { message: "Username too long. Must be less than 12 characters" };

  if (username.length <= 0 || password.length <= 0 || confirm.length <= 0)
    return { message: "Form is incomplete. Fill every field correctly" };

  if (password !== confirm) return { message: "Passwords don't match" };

  const result = await signup(username, password, key);

  if (result.isError()) return result.error;

  return redirect("/login");
}
