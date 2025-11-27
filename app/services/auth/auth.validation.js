import Joi from "joi";
import Constants from "../../config/constants.js";

const AuthValidation = {
  signup: {
    body: {
      name: Joi.string().min(2).max(120).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      role: Joi.string()
        .valid(...Object.values(Constants.roles))
        .required(),
      managerId: Joi.string().guid({ version: "uuidv4" }).optional(),
    },
  },
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
    },
  },
};

export default AuthValidation;

