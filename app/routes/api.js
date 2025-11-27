import { Router } from "express";
import authRoutes from "../services/auth/auth.routes.js";
import userRoutes from "../services/user/user.routes.js";
import TaskRoutes from '../services/task/task.routes.js'
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/task", TaskRoutes);

export default router;

