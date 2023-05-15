import { Result, failure, success } from "~/interfaces/Result";
import { prisma } from "../db.server";
import bcrypt from "bcrypt";
import { ServerError } from "~/interfaces/serverError";

export const signup = async (
  username: string,
  password: string
): Promise<Result<ServerError, { code: number }>> => {
  const usernameExists =
    (await prisma.users.findMany({ where: { username: username } })).length > 0;
  if (usernameExists)
    return failure({
      message: "This username is already taken",
      code: 401,
      error: null,
    });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.users.create({
    data: {
      username,
      hashedPassword,
    },
  });

  return success({ code: 201 });
};
