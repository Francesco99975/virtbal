import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import { prisma } from "../db.server";
import bcrypt from "bcrypt";
import { Users } from "@prisma/client";

const authenticator = new Authenticator<Users>(sessionStorage);
const formStrategy = new FormStrategy(async ({ form }) => {
  const username = (form.get("username") as string)
    .replace(/ /g, "")
    .toLowerCase();
  const password = (form.get("password") as string).replace(/ /g, "");

  const user = await prisma.users.findFirst({
    where: { username },
    include: {
      password: true,
    },
  });

  if (!user || !user.password) throw new AuthorizationError("User not found");

  const passwordsMatch = await bcrypt.compare(password, user.password.hash);

  if (!passwordsMatch) throw new AuthorizationError("Invalid Password");

  return user;
});

authenticator.use(formStrategy, "form");

export { authenticator };
