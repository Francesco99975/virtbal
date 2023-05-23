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

const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const processData = (
  row: RawData,
  transactions: Transaction[],
  startingBalance: { amount: number }
) => {
  if (row.description.includes("STARTING BALANCE"))
    startingBalance.amount = Math.trunc(
      parseFloat(row.balance.replace(/,/g, "")) * 100
    );
  else {
    const isValid = row.deposits !== "" || row.withdrawals !== "";
    const isDpt = row.withdrawals == "";
    if (isValid)
      transactions.push({
        description: row.description,
        amount: !isDpt
          ? Math.trunc(parseFloat(row.withdrawals.replace(/,/g, "")) * 100)
          : Math.trunc(parseFloat(row.deposits.replace(/,/g, "")) * 100),
        isDeposit: isDpt,
        date: row.date,
      });
  }
};

const unzipScript = async () => {
  return await new Promise<string>((resolve, reject) => {
    try {
      if (!shell.pwd().includes("data"))
        shell.cd(path.resolve(__dirname, "data"));

      const yearString = shell.exec(
        path.resolve(__dirname, "scripts", "unzipcsv.sh"),
        { silent: true }
      ).stdout;

      console.log(yearString);

      resolve(yearString.substring(yearString.lastIndexOf("/") + 1));
    } catch (error) {
      return reject(error);
    }
  });
};

const csvScript = async () => {
  return await new Promise<void>((resolve, reject) => {
    try {
      if (!shell.pwd().includes("data"))
        shell.cd(path.resolve(__dirname, "data"));

      shell.exec(path.resolve(__dirname, "scripts", "merge.sh"), () =>
        resolve()
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const parseDataFromCSVs = async (dir: string) => {
  try {
    const year = await unzipScript();
    console.log(year);
    await csvScript();

    return await new Promise<ParsedData>((resolve, reject) => {
      try {
        const transactions: Transaction[] = [];
        const startingBalance: { amount: number } = { amount: 0 };
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
            const date = new Date(
              2000 + +year,
              months.indexOf(
                transactions[0].date.substring(0, 3).toLocaleLowerCase()
              ),
              2
            );
            return resolve({
              transactions,
              startingBalance: startingBalance.amount,
              date,
            });
          })
          .on("error", function (error) {
            reject(error.message);
          });
      } catch (error) {
        reject("We've thrown! Whoops!");
      }
    });
  } catch (error) {
    throw new Error("Script Error");
  }
};
