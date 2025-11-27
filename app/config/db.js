import Logger from "../lib/logger.js";
import { initModels } from "../models/index.js";
import sequelize from "./sequelize.js";

let modelsInitialized = false;

const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      if (!modelsInitialized) {
        initModels();
        modelsInitialized = true;
      }
      await sequelize.sync();
      if (process?.send) process.send("ready");
      Logger.info("PostgreSQL connected successfully !!");
      return;
    } catch (err) {
      Logger.error(
        `PostgreSQL connection attempt ${attempt} failed: ${err.message}`
      );
      if (attempt === retries) {
        Logger.error("Max retries reached. Could not connect to PostgreSQL !");
        throw err;
      }
      const nextDelay = delay * attempt;
      Logger.warn(`Retrying PostgreSQL connection in ${nextDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, nextDelay));
    }
  }
};

process.on("SIGINT", async () => {
  try {
    await sequelize.close();
    Logger.info("PostgreSQL connection closed through app termination !!");
    process.exit(0);
  } catch (err) {
    Logger.error("Error closing PostgreSQL connection:", err);
    process.exit(1);
  }
});

export const initDB = () => connectWithRetry();
export const isDbConnected = () => sequelize.authenticate();
export default sequelize;
