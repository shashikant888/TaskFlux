import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import morgan from "morgan";
import helmet from "helmet";
import http from "http";

import Constants from "./config/constants.js";
import { initDB } from "./config/db.js";
import Logger from "./lib/logger.js";
import routes from "./routes/api.js";
import { errorConverter, errorHandler } from "./middleware/error.js";
import RedisUtils from "./lib/redis.utils.js";

const app = express();
const server = http.createServer(app);

app.use(helmet());
// app.set("view engine", "ejs");

app.use(cors());
app.use(morgan("dev"));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(methodOverride());

app.use(Logger.apiLogger);

app.get("/health", (req, res) =>
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
);
app.use(Constants.apiPrefix, routes);

app.use(errorConverter);
app.use(errorHandler);

try {
  initDB();
  RedisUtils.coldStart()
  server.listen(Constants.server.port, () => {
    
    Logger.info(`
    Server started !!
    Port: ${Constants.server.port}
    Env: ${app.get("env")}
    `);

  });
} catch (err) {
  Logger.error("Failed to start server:", err);
  process.exit(1);
}

export default server;
