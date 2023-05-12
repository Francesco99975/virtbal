import axios, { AxiosResponse } from "axios";
import fs from "fs/promises";
import path from "path";
import FormData from "form-data";
import { parseDataFromCSVs } from "./helpers/parser";
import { ParsedData } from "~/interfaces/parsedData";
import { Statement } from "~/interfaces/statement";
import { ServerError } from "~/interfaces/serverError";
import { Result, failure, success } from "~/interfaces/Result";

export async function parseTd(
  pdfPath: string
): Promise<Result<ServerError, Statement>> {
  try {
    // Send request to flask server attached to tabula, to parse pdf to CSVs
    const pdf = await fs.readFile(pdfPath);

    const form = new FormData();
    form.append("file", pdf, "file.pdf");

    await fs.unlink(pdfPath);

    let zipRequest: AxiosResponse<any, any>;
    try {
      zipRequest = await axios.post("http://127.0.0.1:9888/pdf", form, {
        headers: { ...form.getHeaders() },
        responseType: "stream",
      });
    } catch (error) {
      return failure({
        message: "Could not fullfill request",
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

    // Calculate Results

    const totalDeposited = transactions
      .filter((trs) => trs.isDeposit)
      .reduce((prev, curr) => prev + curr.amount, 0.0);

    const totalSpent = transactions
      .filter((trs) => !trs.isDeposit)
      .reduce((prev, curr) => prev + curr.amount, 0.0);

    const virtualKeep = totalDeposited - totalSpent;

    // Return Results JSON Object

    const statement: Statement = {
      deposited: totalDeposited,
      spent: totalSpent,
      virtualKeep: virtualKeep,
      startingBalance: startingBalance,
      date,
    };

    return success(statement);
  } catch (error) {
    return failure({ message: "Could not fullfill request", error, code: 500 });
  }
}
