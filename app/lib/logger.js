import fs from "fs-extra";
import path from "path";
import winston from "winston";
import "winston-daily-rotate-file";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import Constants from "../config/constants.js";

const logDir = path.resolve("./logs");
fs.ensureDirSync(logDir);

const fileFormat = winston.format.printf(
  ({ timestamp, level, message, moduleName, meta }) => {
    return `${timestamp} [${level.toUpperCase()}] [${
      moduleName || "App"
    }]: ${message}${
      meta && Object.keys(meta).length ? " | " + JSON.stringify(meta) : ""
    }`;
  }
);

const consoleFormat = winston.format.printf(
  ({ timestamp, level, message, moduleName, meta }) => {
    let colorFn;
    switch (level) {
      case "info":
        colorFn = chalk.blue;
        break;
      case "warn":
        colorFn = chalk.yellow;
        break;
      case "error":
        colorFn = chalk.red;
        break;
      case "debug":
        colorFn = chalk.green;
        break;
      default:
        colorFn = chalk.white;
    }
    return colorFn(
      `${timestamp} [${level.toUpperCase()}] [${
        moduleName || "App"
      }]: ${message}${
        meta && Object.keys(meta).length ? " | " + JSON.stringify(meta) : ""
      }`
    );
  }
);

function getModuleName() {
  const stack = new Error().stack?.split("\n")[3]; // caller line
  const match = stack?.match(/\/([\w-]+)\.js/);
  return match ? match[1] : "App";
}

const createDailyTransport = (level) => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(logDir, `${level}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "30d",
    level,
    format: winston.format.combine(
      // ensure only that level goes to that file
      winston.format((info) => (info.level === level ? info : false))(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      fileFormat
    ),
  });
};

const transports = [];
if (Constants.LOGGER_ENABLED) {
  transports.push(createDailyTransport("error"));
  transports.push(createDailyTransport("warn"));
  transports.push(createDailyTransport("info"));
  transports.push(createDailyTransport("debug"));
}

const winstonLogger = winston.createLogger({
  level: Constants.logging.level || "info",
  transports,
});

if (Constants.LOGGER_ENABLED) {
  winstonLogger.exceptions.handle(createDailyTransport("error"));
  winstonLogger.rejections.handle(createDailyTransport("error"));
}

winstonLogger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      consoleFormat
    ),
  })
);

const Logger = {
  log: (...args) => {
    if (Constants.LOG_ENABLED) {
      console.log(...args);
    }
  },

  info: (msg, meta = {}) => {
    const moduleName = getModuleName();
    const message = typeof msg === "string" ? msg : JSON.stringify(msg);
    winstonLogger.info(message, { moduleName, meta });
  },

  warn: (msg, meta = {}) => {
    const moduleName = getModuleName();
    const message = typeof msg === "string" ? msg : JSON.stringify(msg);
    winstonLogger.warn(message, { moduleName, meta });
  },

  error: (msg, meta = {}) => {
    const moduleName = getModuleName();
    const message = typeof msg === "string" ? msg : JSON.stringify(msg);
    winstonLogger.error(message, { moduleName, meta });
  },

  debug: (msg, meta = {}) => {
    const moduleName = getModuleName();
    const message = typeof msg === "string" ? msg : JSON.stringify(msg);
    winstonLogger.debug(message, { moduleName, meta });
  },

  apiLogger: (req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId;
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const msg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      Logger.info(`[API] ${msg}`, {
        requestId,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        params: req.params,
        query: req.query,
        body: req.body,
      });
    });

    next();
  },
};

process.on("uncaughtException", (err) => {
  Logger.error("Uncaught Exception", { stack: err.stack || err });
});

process.on("unhandledRejection", (reason) => {
  Logger.error("Unhandled Rejection", { reason });
});

export default Logger;
