import { cssBundleHref } from "@remix-run/css-bundle";
import stylesheet from "~/tailwind.css";
import {
  ActionArgs,
  LinksFunction,
  LoaderArgs,
  redirect,
} from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { Header } from "./components/Header/Header";
import { useContext, useEffect, useState } from "react";
import ThemeContext from "./store/theme-context";
import { logout } from "./server/auth/logout.server";
import { getVirtualKeep } from "./server/fetch.server";
import Loading from "./components/UI/Loading";
import { decryptData } from "./helpers/decrypt";
import { authenticator } from "./server/auth/auth.server";
import { Decrypting } from "./components/UI/Decrypting";
import GlobalValuesContext from "./store/global-values-context";

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [
        { rel: "stylesheet", href: cssBundleHref },
        { rel: "stylesheet", href: stylesheet },
      ]
    : [{ rel: "stylesheet", href: stylesheet }]),
];

export async function loader(args: LoaderArgs) {
  const response = await getVirtualKeep(args);

  if (response.isError()) {
    console.log(response.error.message);
    return {
      encryptedKeeps: [],
      username: "",
    };
  }

  return {
    encryptedKeeps: response.value.encryptedKeeps,
    username: response.value.username,
  };
}

export default function App() {
  const { isDark, set } = useContext(ThemeContext);
  const { setCurrentKeep, setCurrentUsername } =
    useContext(GlobalValuesContext);
  const { encryptedKeeps, username } = useLoaderData() as unknown as {
    encryptedKeeps: string[];
    username: string;
  };
  const [loading, setLoading] = useState(true);

  const decryptBalance = async () => {
    try {
      if (!encryptedKeeps || encryptedKeeps.length <= 0) {
        setLoading(false);
        return;
      }

      let balance = 0;

      for (const encryptedKeep of encryptedKeeps) {
        const keep = +(await decryptData(encryptedKeep, username));
        balance += keep;
      }

      setCurrentKeep(balance);
    } catch (error) {
      throw Error(
        "Something went wrong while decrypting total virtual balance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    set();
    setCurrentUsername(username);
    decryptBalance();
  }, []);

  if (loading) {
    return (
      <html lang="en" className={isDark ? "dark" : ""}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="dark:bg-bcd bg-bl">
          <div id="backdrop"></div>
          <div id="modal"></div>
          <div id="backload"></div>
          <div id="loading"></div>
          <Decrypting />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-bcd bg-bl">
        <div id="backdrop"></div>
        <div id="modal"></div>
        <div id="backload"></div>
        <div id="loading"></div>
        <Header />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export async function action(args: ActionArgs) {
  const data = await args.request.formData();
  if (data.get("logout")?.toString() === "logout") {
    return await logout(args);
  }
}

export function ErrorBoundary() {
  const { isDark, set } = useContext(ThemeContext);
  const error: any = useRouteError();

  useEffect(() => {
    set();
  }, []);

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en" className={isDark ? "dark" : ""}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
          <title>A server error as occurred</title>
        </head>
        <body className="dark:bg-bcd">
          <div id="backdrop"></div>
          <div id="modal"></div>
          <div id="backload"></div>
          <div id="loading"></div>
          <Header />
          <main className="flex flex-col w-full items-center">
            <h1 className="bg-error text-primary text-xl m-2 p-2 rounded-md text-center">
              An error occurred! Code: {error.status}
            </h1>
            <p className="bg-error text-primary text-lg p-2 rounded-sm text-center">
              {error.data.message}
            </p>
            <Link
              to="/login"
              className="text-accent dark:text-primary hover:underline m-5 text-center text-2xl"
            >
              Back to safety
            </Link>
          </main>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <title>An error as occurred</title>
      </head>
      <body className="dark:bg-bcd">
        <div id="backload"></div>
        <div id="loading"></div>
        <Header />
        <main className="flex flex-col w-full items-center">
          <h1 className="bg-error text-primary text-xl m-2 p-2 rounded-md text-center">
            An error occurred!
          </h1>
          <p className="bg-error text-primary text-lg p-2 rounded-sm text-center">
            {error.message}
          </p>
          <Link
            to="/login"
            className="text-accent dark:text-primary hover:underline m-5 text-center text-2xl"
          >
            Back to safety
          </Link>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
