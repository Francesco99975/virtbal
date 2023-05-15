import { ActionArgs } from "@remix-run/node";
import { authenticator } from "./auth.server";

export const login = async ({ request }: ActionArgs) => {
  return await authenticator.authenticate("form", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
