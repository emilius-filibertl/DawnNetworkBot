import chalk from "chalk";

import { readAccounts } from "./src/readConfig.js";
import { keepAlive } from "./src/keepAlive.js";
import { nodeInfo } from "./src/nodeInfo.js";

const equals = "=".repeat(100);
const dash = "-".repeat(100);

const delay = () => new Promise((resolve) => setTimeout(resolve, 60000));

const runSession = async () => {
  let session = 1;

  const accounts = await readAccounts();

  while (true) {
    console.log(`${equals}`);
    console.log(`${chalk.green(`Starting session ${session}... `)}`);

    for (const account of accounts) {
      console.log(`${dash}`);

      const { email, appid, token } = account;

      console.log(chalk.yellow(`Running for email: ${chalk.cyan(email)}\n`));

      console.log(chalk.yellow(`Keeping node alive...`));
      await keepAlive(email, appid, token);

      console.log(chalk.yellow(`Getting node info...`));
      await nodeInfo(appid, token);
    }

    let temp = session + 1;

    console.log(
      `${dash}\n${chalk.green(
        `End of session ${session} | Wait 1 minutes for the next session ${temp} | Stop code execution "Ctrl+c"`
      )}\n${equals}\n`
    );

    session++;

    await delay();
  }
};

await runSession();
