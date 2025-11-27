import { Router } from "express";
import AuthMiddleware from "../../middleware/auth.middleware.js";
import SchemaValidator from "../../middleware/SchemaValidator.js";
import UserController from "./user.controller.js";
import UserValidation from "./user.validation.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import Constants from "../../config/constants.js";

const router = Router();

router.get("/me",
  AuthMiddleware,
  UserController.getMe
);

router.get("/",
  AuthMiddleware,
  // roleMiddleware([Constants.roles.MANAGER]),
  SchemaValidator(UserValidation.list),
  UserController.list
);

router.get("/:id",
  AuthMiddleware,
  SchemaValidator(UserValidation.getById),
  UserController.getById
);

export default router;

