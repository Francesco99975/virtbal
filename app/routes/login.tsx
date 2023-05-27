import { ActionArgs } from "@remix-run/node";
import { Form, Link, useNavigation, useSubmit } from "@remix-run/react";
import { useContext, useEffect } from "react";
import Button from "~/components/UI/Button";
import Input from "~/components/UI/Input";
import Loading from "~/components/UI/Loading";
import { authenticator } from "~/server/auth/auth.server";
import { login } from "~/server/auth/login.server";
import GlobalValuesContext from "~/store/global-values-context";

export async function loader({ request }: ActionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function Login() {
  const navigation = useNavigation();
  const { setCurrentKeep, setCurrentUsername } =
    useContext(GlobalValuesContext);

  useEffect(() => {
    setCurrentKeep(0);
    setCurrentUsername("");
  }, []);
  return (
    <div className="flex justify-center items-center w-full h-[85vh]">
      <Form
        method="post"
        id="form"
        className="flex flex-col w-3/4 md:w-1/3 justify-between items-center rounded-md bg-darkAccent dark:bg-primary p-5"
      >
        <h1 className="text-xl md:text-3xl dark:text-accent text-primary">
          Log In
        </h1>
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

        <Button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="bg-primary text-accent dark:bg-darkAccent dark:text-primary w-2/4 mt-3"
        >
          Login
        </Button>

        <Link
          to="/signup"
          className="text-lg text-primary dark:text-accent mt-6 text-center"
        >
          I don't have am account yet
        </Link>
      </Form>
      {navigation.state === "submitting" && <Loading />}
    </div>
  );
}

export async function action(args: ActionArgs) {
  return await login(args);
}
