import chalk from "chalk";

import { readAccounts } from "./src/readConfig.js";
import { keepAlive } from "./src/keepAlive.js";
import { nodeInfo } from "./src/nodeInfo.js";

const { green, yellow, cyan } = chalk;

const equals = "=".repeat(100);
const dash = "-".repeat(100);

const runSession = async () => {
  let session = 1;

  const accounts = await readAccounts();

  while (true) {
    console.log(equals);
    console.log(green(`Starting session ${session}... `));

    for (const account of accounts) {
      console.log(dash);

      const { email, appid, token } = account;

      console.log(yellow(`Running for email: ${cyan(email)}\n`));

      console.log(yellow(`Keeping node alive...`));
      await keepAlive(email, appid, token);

      console.log(yellow(`Getting node info...`));
      await nodeInfo(appid, token);
    }

    let temp = session + 1;

    console.log(dash);
    console.log(
      green(
        `End of session ${session} | Wait 1 minutes for the next session ${temp} | Stop code execution "Ctrl+c"`
      )
    );
    console.log(`${equals}\n`);

    session++;

    // Delay 1 minute
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }
};

await runSession();
