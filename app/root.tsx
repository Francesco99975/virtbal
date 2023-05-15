import { cssBundleHref } from "@remix-run/css-bundle";
import stylesheet from "~/tailwind.css";
import { ActionArgs, LinksFunction, json, redirect } from "@remix-run/node";
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
import { useContext, useEffect } from "react";
import ThemeContext from "./store/theme-context";
import { logout } from "./server/auth/logout.server";
import { getVirtualKeep } from "./server/fetch.server";

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [
        { rel: "stylesheet", href: cssBundleHref },
        { rel: "stylesheet", href: stylesheet },
      ]
    : [{ rel: "stylesheet", href: stylesheet }]),
];

export async function loader(args: ActionArgs) {
  const response = await getVirtualKeep(args);

  if (response.isError()) {
    return { balance: response.error.message };
  }

  return { balance: response.value };
}

export default function App() {
  const { isDark, set } = useContext(ThemeContext);
  const { balance } = useLoaderData();

  useEffect(() => {
    set();
  }, []);

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-bcd">
        <div id="backload"></div>
        <div id="loading"></div>
        <Header balance={balance} />
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
          <div id="backload"></div>
          <div id="loading"></div>
          <Header />
          <main className="flex flex-col w-full">
            <h1 className="bg-error text-primary text-xl m-2 p-2">
              An error occurred! Code: {error.status}
            </h1>
            <p className="bg-error text-primary text-lg p-2">
              {error.data.message}
            </p>
            <Link
              to="/login"
              className="text-accent dark:text-primary hover:underline"
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
        <main className="flex flex-col w-full">
          <h1 className="bg-error text-primary text-xl m-2 p-2">
            An error occurred!
          </h1>
          <p className="bg-error text-primary text-lg p-2">{error.message}</p>
          <Link
            to="/login"
            className="text-accent dark:text-primary hover:underline"
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
