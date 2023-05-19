import axios, { AxiosResponse } from "axios";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import FormData from "form-data";
import { parseDataFromCSVs } from "./helpers/parser.server";
import { ParsedData } from "~/interfaces/parsedData";
import { Statement } from "~/interfaces/statement";
import { ServerError } from "~/interfaces/serverError";
import { Result, failure, success } from "~/interfaces/Result";
import { prisma } from "./db.server";
import { UploadedFile } from "~/interfaces/UploadedFile";

export async function parseTd(
  pdfData: UploadedFile,
  accountId: string
): Promise<Result<ServerError, Statement>> {
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

    // Calculate Results

    const totalDeposited = transactions
      .filter((trs) => trs.isDeposit)
      .reduce((prev, curr) => prev + curr.amount, 0);

    const totalSpent = transactions
      .filter((trs) => !trs.isDeposit)
      .reduce((prev, curr) => prev + curr.amount, 0);

    const virtualKeep = totalDeposited - totalSpent;

    // Return Results JSON Object

    const statement: Statement = await prisma.statements.create({
      data: {
        deposited: totalDeposited,
        spent: totalSpent,
        keep: virtualKeep,
        startingBalance,
        fileHash,
        date,
        accountId,
      },
    });

    for (const transaction of transactions) {
      await prisma.transactions.create({
        data: { ...transaction, statementId: statement.id },
      });
    }

    return success(statement);
  } catch (error) {
    console.log(error);
    return failure({ message: "Something went wrong", error, code: 500 });
  }
}

export async function deleteStatement(
  statementId: string
): Promise<Result<ServerError, Statement>> {
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
