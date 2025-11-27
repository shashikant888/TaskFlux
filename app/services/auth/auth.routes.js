import { Router } from "express";
import SchemaValidator from "../../middleware/SchemaValidator.js";
import AuthController from "./auth.controller.js";
import AuthValidation from "./auth.validation.js";
import AuthMiddleware from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", SchemaValidator(AuthValidation.signup), AuthController.signup);
router.post("/login", SchemaValidator(AuthValidation.login), AuthController.login);
router.post("/logout", AuthMiddleware, AuthController.logout);

export default router;

