import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as priorityControllers from "../controllers/priority.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  priorityControllers.savePriority
);

router.get(
  "/project/:id",
  authMiddlewares.auth,
  priorityControllers.getPriorityByProject
);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  priorityControllers.updatePriority
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  priorityControllers.deletePriority
);

export default router;
