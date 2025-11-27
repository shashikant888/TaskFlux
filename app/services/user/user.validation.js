import Joi from "joi";
import Constants from "../../config/constants.js";

const UserValidation = {
  getById: {
    params: {
      id: Joi.string().guid({ version: "uuidv4" }).required(),
    },
  },
  list: {
    query: {
      role: Joi.string()
        .valid(...Object.values(Constants.roles))
        .optional(),
    },
  },
};

export default UserValidation;

