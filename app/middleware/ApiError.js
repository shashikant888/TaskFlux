import httpStatus from "http-status";

class ApiError extends Error {
  constructor(
    statusCode = httpStatus.INTERNAL_SERVER_ERROR,
    message = "Something went wrong",
    errors = null,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
  }
}

export default ApiError;

