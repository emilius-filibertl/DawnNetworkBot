import axios from "axios";
import chalk from "chalk";

import { readProxy } from "./readConfig.js";

const { red } = chalk;

const retry = async (retryCount) => {
  console.log(
    red(`Wait 2.5 seconds before retrying... (Retry #${retryCount})\n`)
  );

  // Delay 2.5 second
  await new Promise((resolve) => setTimeout(resolve, 2500));
};

const convertTime = async (time) => {
  const date = new Date(time);
  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const formattedDate = formatter.format(date);
  return `${formattedDate} WIB`;
};

const nodeInfo = async (appid, token) => {
  const URL = `https://www.aeropres.in/api/atom/v1/userreferral/getpoint?appid=${appid}`;

  const headers = {
    authorization: `Berear ${token}`,
    "content-type": "application/json",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  const { username, password, hostname, port } = await readProxy();

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.get(URL, {
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
        const { rewardPoint } = response.data.data;
        const { points, active_status, lastKeepAlive } = rewardPoint;
        const { servername } = response.data;
        const time = await convertTime(lastKeepAlive);

        console.log(`Points: ${points}`);
        console.log(`Active Status: ${active_status}`);
        console.log(`Servername: ${servername}`);
        console.log(`Last Keep Alive: ${time}\n`);
        return;
      } else {
        // Error response 2xx
        console.log(red(`Error encountered during nodeInfo:`));
        console.log(red(`Status: ${status}`));
        console.log(red(`Message: ${data?.message || "Unknown error"}`));

        await retry(++retryCount);
      }
    } catch (error) {
      // Error response 4xx and 5xx etc
      console.log(red(`Error encountered during nodeInfo:`));

      if (error.response) {
        const { status, data } = error.response;

        if (status === 401 || status === 403) {
          console.log(red(`Authentication Error: ${status}`));
          console.log(red(`Please check your token or credentials.\n`));
          // Stop retrying after authentication error
          return;
        }

        console.log(red(`Status: ${status}`));
        console.log(red(`Message: ${data?.message || "Unknown error"}`));
      } else {
        // Network or unknown error
        console.log(red(`Network or unknown error: ${error.message}`));
      }

      await retry(++retryCount);
    }
  }

  console.log(red(`Max retries reached. Giving up :(\n`));
};

export { nodeInfo };
