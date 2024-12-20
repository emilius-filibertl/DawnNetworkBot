import axios from "axios";
import chalk from "chalk";
import { readProxy } from "./readConfig.js";

const { green, red } = chalk;

const delay = () => new Promise((resolve) => setTimeout(resolve, 2500));

const logRetry = async (retryCount) => {
  console.log(
    chalk.red(`Wait 2.5 seconds before retrying... (Retry #${retryCount})\n`)
  );
  await delay();
};

const keepAlive = async (email, appid, token) => {
  const URL = `https://www.aeropres.in/chromeapi/dawn/v1/userreward/keepalive?appid=${appid}`;

  const payload = {
    username: `${email}`,
    extensionid: "fpdkjdnhkakefebpekbdhillbhonfjjp",
    numberoftabs: 0,
    _v: "1.1.2",
  };

  const headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9,ru;q=0.8",
    authorization: `Berear ${token}`,
    "content-type": "application/json",
    origin: "chrome-extension://fpdkjdnhkakefebpekbdhillbhonfjjp",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  const { username, password, hostname, port } = await readProxy();

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.post(URL, payload, {
        headers: headers,
        proxy: {
          protocol: "http",
          host: hostname,
          port: port,
          auth: {
            username,
            password,
          },
        },
      });

      const { status, data } = response;

      if (status === 200) {
        console.log(green("Success\n"));
        return;
      } else {
        // Error response 2xx
        console.log(red(`Error encountered during keepAlive:`));
        console.log(red(`Error status: ${status}`));
        console.log(red(`Error message: ${data?.message || "Unknown error"}`));

        await logRetry(++retryCount);
      }
    } catch (error) {
      // Error response 4xx and 5xx etc
      console.log(red(`Error encountered during keepAlive:`));

      if (error.response) {
        const { status, data } = error.response;

        // Response from server, handle error response status
        if (status === 401 || status === 403) {
          console.log(red(`Authentication Error: ${status}`));
          console.log(red(`Please check your token or credentials.\n`));
          // Stop retrying after authentication error
          return;
        }

        console.log(red(`Error status: ${status}`));
        console.log(red(`Error message: ${data?.message || "Unknown error"}`));
      } else {
        // Network or unknown error
        console.log(red(`Network or unknown error: ${error.message}`));
      }

      await logRetry(++retryCount);
    }
  }

  console.log(chalk.red(`Max retries reached. Giving up.\n`));
};

export { keepAlive };
