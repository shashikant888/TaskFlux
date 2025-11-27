import Joi from "joi";
import httpStatus from "http-status";
import ApiError from "./ApiError.js";

const SchemaValidator = (schema) => (req, res, next) => {
  const validSchema = {};
  const dataToValidate = {};

  ["params", "query", "body", "headers"].forEach((key) => {
    if (schema[key]) {
      validSchema[key] = Joi.object(schema[key]);
      dataToValidate[key] = req[key];
    }
  });

  const validationSchema = Joi.object(validSchema).prefs({
    errors: { label: "key" },
    abortEarly: false,
  });

  const { value, error } = validationSchema.validate(dataToValidate);
  if (error) {
    const errMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return next(
      new ApiError(httpStatus.BAD_REQUEST, errMessage, error.details)
    );
  }

  Object.keys(value).forEach((key) => {
    Object.assign(req[key], value[key]);
  });
  return next();
};

export default SchemaValidator;

