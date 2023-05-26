import axios, { AxiosResponse } from "axios";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import FormData from "form-data";
import { parseDataFromCSVs } from "./helpers/parser.server";
import { ParsedData } from "~/interfaces/parsedData";
import { ServerError } from "~/interfaces/serverError";
import { Result, failure, success } from "~/interfaces/Result";
import { prisma } from "./db.server";
import { UploadedFile } from "~/interfaces/UploadedFile";
import { readKey } from "openpgp";
import { encryptData } from "./helpers/encrypt.server";
import { Statements } from "@prisma/client";

export async function parseTd(
  pdfData: UploadedFile,
  accountId: string,
  userId: string
): Promise<Result<ServerError, { code: number }>> {
  try {
    // Send request to flask server attached to tabula, to parse pdf to CSVs
    const pdf = await fs.readFile(pdfData.filepath);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(pdf);

    const fileHash = hashSum.digest("hex");

    const hashExists =
      (await prisma.statements.findFirst({ where: { fileHash } })) != null;

    if (hashExists)
      return failure({
        message: "This file was already uploaded",
        error: null,
        code: 401,
      });

    const form = new FormData();
    form.append("file", pdf, pdfData.name);

    await fs.unlink(pdfData.filepath);

    let zipRequest: AxiosResponse<any, any>;
    try {
      zipRequest = await axios.post("http://127.0.0.1:9888/pdf", form, {
        headers: { ...form.getHeaders() },
        responseType: "stream",
      });
    } catch (error) {
      console.log(error);
      return failure({
        message: "Could not parse file through tabula",
        error,
        code: 500,
      });
    }

    // Write CSVs ZIP to data folder

    await fs.writeFile(
      path.resolve(__dirname, "data", "csvs.zip"),
      zipRequest.data
    );

    // Read all CSVs into data structure array

    const { transactions, startingBalance, date }: ParsedData =
      await parseDataFromCSVs(path.resolve(__dirname, "data"));

    const existingDate =
      (await prisma.statements.findMany({ where: { date: date } })).length > 0;

    if (existingDate)
      return failure({
        message: `A Statement for ${new Date(date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })} was already uploaded`,
        error: null,
        code: 401,
      });

    // Get Encryption Key

    const user = await prisma.users.findFirst({
      where: { id: userId },
      include: { publicKey: { select: { armored: true } } },
    });
    if (!user)
      return failure({ message: "User not found", error: null, code: 404 });
    if (!user.publicKey)
      return failure({ message: "Key not found", error: null, code: 404 });

    const key: string = user.publicKey.armored;
    const publicKey = await readKey({ armoredKey: key });

    // Calculate Results
    const rawDeposit = transactions
      .filter((trs) => trs.isDeposit)
      .reduce((prev, curr) => prev + curr.amount, 0);
    const totalDeposited = await encryptData(rawDeposit.toString(), publicKey);

    const rawSpent = transactions
      .filter((trs) => !trs.isDeposit)
      .reduce((prev, curr) => prev + curr.amount, 0);
    const totalSpent = await encryptData(rawSpent.toString(), publicKey);

    const virtualKeep = await encryptData(
      (rawDeposit - rawSpent).toString(),
      publicKey
    );

    const startingBalanceEncrypted = await encryptData(
      startingBalance.toString(),
      publicKey
    );

    // Return Results JSON Object

    const statement: Statements = await prisma.statements.create({
      data: {
        deposited: totalDeposited,
        spent: totalSpent,
        keep: virtualKeep,
        startingBalance: startingBalanceEncrypted,
        fileHash,
        date,
        accountId,
      },
    });

    for (const transaction of transactions) {
      const encryptedAmount = await encryptData(
        transaction.amount.toString(),
        publicKey
      );

      const encryptedDescripttion = await encryptData(
        transaction.description,
        publicKey
      );
      await prisma.transactions.create({
        data: {
          description: encryptedDescripttion,
          amount: encryptedAmount,
          date: transaction.date,
          isDeposit: transaction.isDeposit,
          statementId: statement.id,
        },
      });
    }

    return success({ code: 201 });
  } catch (error) {
    console.log(error);
    return failure({ message: "Something went wrong", error, code: 500 });
  }
}

export async function deleteStatement(
  statementId: string
): Promise<Result<ServerError, Statements>> {
  try {
    const deletedStatement = await prisma.statements.delete({
      where: { id: statementId },
    });

    if (!deletedStatement)
      return failure({
        message: "Statement not found",
        error: null,
        code: 404,
      });

    return success(deletedStatement);
  } catch (error) {
    console.log(error);
    return failure({ message: "Something went wrong", error, code: 500 });
  }
}
