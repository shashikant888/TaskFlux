import { Router } from "express";
import AuthMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import SchemaValidator from "../../middleware/SchemaValidator.js";
import Constants from "../../config/constants.js";
import TaskValidation from "./task.validation.js";
import taskController from "./task.controller.js";

const router = Router();

router.get("/",
  AuthMiddleware,
  SchemaValidator(TaskValidation.list),
  taskController.list
);

router.post("/",
  AuthMiddleware,
  roleMiddleware([Constants.roles.EMPLOYEE]),
  SchemaValidator(TaskValidation.create),
  taskController.create
);

router.get(
  "/:id",
  AuthMiddleware,
  SchemaValidator(TaskValidation.byId),
  taskController.getById
);

router.patch(
  "/:id/approve",
  AuthMiddleware,
  roleMiddleware([Constants.roles.MANAGER]),
  SchemaValidator(TaskValidation.byId),
  taskController.approve
);

router.patch(
  "/:id/reject",
  AuthMiddleware,
  roleMiddleware([Constants.roles.MANAGER]),
  SchemaValidator(TaskValidation.byId),
  taskController.reject
);

router.patch(
  "/:id/start",
  AuthMiddleware,
  roleMiddleware([Constants.roles.EMPLOYEE]),
  SchemaValidator(TaskValidation.byId),
  taskController.start
);

router.patch(
  "/:id/close",
  AuthMiddleware,
  roleMiddleware([Constants.roles.EMPLOYEE]),
  SchemaValidator(TaskValidation.byId),
  taskController.close
);

export default router;

