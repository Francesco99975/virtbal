import { ActionArgs } from "@remix-run/node";
import { authenticator } from "./auth.server";

export async function logout({ request }: ActionArgs) {
  return await authenticator.logout(request, {
    redirectTo: "/login",
  });
}
