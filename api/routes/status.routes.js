import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as statusControllers from "../controllers/status.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  statusControllers.saveStatus
);

router.get(
  "/project/:id",
  authMiddlewares.auth,
  statusControllers.getStatusByProject
);

router.get("/", authMiddlewares.auth, statusControllers.getStatusesByProjects);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  statusControllers.updateStatus
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  statusControllers.deleteStatus
);

export default router;
