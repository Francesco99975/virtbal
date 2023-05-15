import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import { prisma } from "../db.server";
import bcrypt from "bcrypt";
import { Users } from "@prisma/client";

const authenticator = new Authenticator<Users>(sessionStorage);
const formStrategy = new FormStrategy(async ({ form }) => {
  const username = form.get("username") as string;
  const password = form.get("password") as string;

  const user = await prisma.users.findFirst({ where: { username } });

  if (!user) throw new AuthorizationError();

  const passwordsMatch = bcrypt.compare(password, user.hashedPassword);

  if (!passwordsMatch) throw new AuthorizationError();

  return user;
});

authenticator.use(formStrategy, "form");

export { authenticator };
