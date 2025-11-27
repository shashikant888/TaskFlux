import { Sequelize } from "sequelize";
import Constants from "./constants.js";
import Logger from "../lib/logger.js";

const pgConfig = Constants.postgres;

if (!pgConfig?.database || !pgConfig?.username) {
  Logger.error(
    "Postgres configuration missing. Ensure POSTGRES_* env vars are set."
  );
}

// Single Sequelize instance for the whole app
const sequelize = new Sequelize(
  pgConfig?.database || "postgres",
  pgConfig?.username || "postgres",
  pgConfig?.password || "",
  {
    host: pgConfig?.host || "127.0.0.1",
    port: pgConfig?.port || 5432,
    dialect: "postgres",
    logging: pgConfig?.logging ? (msg) => Logger.debug(msg) : false,
    pool: {
      max: pgConfig?.pool?.max ?? 10,
      min: pgConfig?.pool?.min ?? 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: pgConfig?.ssl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
  }
);

export default sequelize;


