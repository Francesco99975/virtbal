import { prisma } from "../db.server";
import bcrypt from "bcrypt";

export const signup = async (username: string, password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return await prisma.users.create({
    data: {
      username,
      hashedPassword,
    },
  });
};
