import { Result, failure, success } from "~/interfaces/Result";
import { ServerError } from "~/interfaces/serverError";
import { prisma } from "../db.server";
import { AuthorizationError } from "remix-auth";
import bcrypt from "bcrypt";
import { Users } from "@prisma/client";

export const updateUsername = async (
  newUsername: string,
  userId: string,
  password: string
): Promise<Result<ServerError, string>> => {
  try {
    const user = await prisma.users.findFirst({
      where: { id: userId },
      include: {
        password: true,
      },
    });

    if (!user || !user.password) throw new AuthorizationError("User not found");

    const passwordsMatch = await bcrypt.compare(password, user.password.hash);

    if (!passwordsMatch)
      return failure({
        message: "Wrong password",
        code: 401,
        error: null,
      });

    const usernameExists =
      (await prisma.users.findMany({ where: { username: newUsername } }))
        .length > 0;

    if (usernameExists)
      return failure({
        message: "This username is already taken",
        code: 401,
        error: null,
      });

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { username: newUsername },
    });

    return success(updatedUser.username);
  } catch (error) {
    return failure({
      message: "Something went wrong while updating username",
      code: 500,
      error: error,
    });
  }
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
  userId: string
): Promise<Result<ServerError, string>> => {
  try {
    const user = await prisma.users.findFirst({
      where: { id: userId },
      include: {
        password: true,
      },
    });

    if (!user || !user.password) throw new AuthorizationError("User not found");

    const passwordsMatch = await bcrypt.compare(
      currentPassword,
      user.password.hash
    );

    if (!passwordsMatch)
      return failure({
        message: "Wrong password",
        code: 401,
        error: null,
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { password: { update: { hash: hashedPassword } } },
    });

    return success(updatedUser.username);
  } catch (error) {
    return failure({
      message: "Something went wrong while updating username",
      code: 500,
      error: error,
    });
  }
};

export const deleteProfile = async (
  userId: string,
  password: string
): Promise<Result<ServerError, Users>> => {
  try {
    const user = await prisma.users.findFirst({
      where: { id: userId },
      include: {
        password: true,
      },
    });

    if (!user || !user.password) throw new AuthorizationError("User not found");

    const passwordsMatch = await bcrypt.compare(password, user.password.hash);

    if (!passwordsMatch)
      return failure({
        message: "Wrong password",
        code: 401,
        error: null,
      });

    const deletedUser = await prisma.users.delete({ where: { id: userId } });

    return success(deletedUser);
  } catch (error) {
    return failure({
      message: "Something went wrong while deleting profile",
      code: 500,
      error: error,
    });
  }
};
