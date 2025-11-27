import httpStatus from "http-status";
import Logger from "../lib/logger.js";
import ApiError from "./ApiError.js";
import resConv from "./resConv.js";

export const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode] || "Unknown error";
    error = new ApiError(statusCode, message, error.stack, false);
  }
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const { statusCode = httpStatus.INTERNAL_SERVER_ERROR, message, errors } = err;
  const responseBody = resConv(
    {
      error: {
        message,
        // errors,
        path: req.originalUrl,
        method: req.method,
      },
    },
    {
      response_code: 0,
      response_message: message || "Request failed!",
    }
  );

  if (!err.isOperational) {
    Logger.error("Unhandled error", { err });
  } else {
    Logger.warn("Api error", { message, statusCode, path: req.originalUrl });
  }

  res.status(statusCode).json(responseBody);
};

