import Joi from "joi";
import Constants from "../../config/constants.js";

const TaskValidation = {
  create: {
    body: {
      title: Joi.string().min(3).max(255).required(),
      description: Joi.string().min(5).required(),
      assignedToId: Joi.string().guid({ version: "uuidv4" }).required(),
    },
  },

  list: {
    query: {
      status: Joi.string().valid(...Object.values(Constants.taskStatus)).optional(),
      createdBy: Joi.string().guid({ version: "uuidv4" }).optional(),
      assignedTo: Joi.string().guid({ version: "uuidv4" }).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    },
  },

  byId: {
    params: {
      id: Joi.string().guid({ version: "uuidv4" }).required(),
    },
  },
  
};

export default TaskValidation;

