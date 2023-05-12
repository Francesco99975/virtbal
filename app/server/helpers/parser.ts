import fs from "fs";
import csv from "csv-parser";
import path from "path";
import Transaction from "../../interfaces/transaction";
import shell from "shelljs";
import { ParsedData } from "~/interfaces/parsedData";

interface RawData {
  description: string;
  withdrawals: string;
  deposits: string;
  date: string;
  balance: string;
}

const processData = (
  row: RawData,
  transactions: Transaction[],
  startingBalance: number
) => {
  if (row.description.includes("STARTING BALANCE"))
    startingBalance = parseFloat(row.balance.replace(/,/g, ""));
  else {
    const isValid = row.deposits !== "" || row.withdrawals !== "";
    const isDpt = row.withdrawals == "";
    if (isValid)
      transactions.push({
        description: row.description,
        amount: !isDpt
          ? parseFloat(row.withdrawals.replace(/,/g, ""))
          : parseFloat(row.deposits.replace(/,/g, "")),
        isDeposit: isDpt,
        date: row.date,
      });
  }
};

const unzipScript = async () => {
  return await new Promise<void>((resolve, reject) => {
    try {
      if (!shell.pwd().includes("data"))
        shell.cd(path.resolve(__dirname, "..", "data"));

      shell.exec(path.resolve(__dirname, "..", "scripts", "unzipcsv.sh"), () =>
        resolve()
      );
    } catch (error) {
      reject();
    }
  });
};

const csvScript = async () => {
  return await new Promise<void>((resolve, reject) => {
    try {
      if (!shell.pwd().includes("data"))
        shell.cd(path.resolve(__dirname, "..", "data"));

      shell.exec(path.resolve(__dirname, "..", "scripts", "merge.sh"), () =>
        resolve()
      );
    } catch (error) {
      reject();
    }
  });
};

export const parseDataFromCSVs = async (dir: string) => {
  await unzipScript();
  await csvScript();

  return await new Promise<ParsedData>((resolve, reject) => {
    try {
      const transactions: Transaction[] = [];
      const startingBalance: number = 0.0;
      const promises: any[] = [];

      fs.createReadStream(path.resolve(dir, "combined.csv"))
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.toLowerCase(),
          })
        )
        .on("data", function (row: RawData) {
          promises.push(processData(row, transactions, startingBalance));
        })
        .on("end", async function () {
          await Promise.all(promises);
          if (shell.pwd().includes("data")) {
            shell.rm("*");
            shell.cd(path.resolve(__dirname));
          }
          return resolve({ transactions, startingBalance, date: new Date() });
        })
        .on("error", function (error) {
          reject(error.message);
        });
    } catch (error) {
      reject("We've thrown! Whoops!");
    }
  });
};