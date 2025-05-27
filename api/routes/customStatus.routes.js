import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as customStatusController from "../controllers/customStatus.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  customStatusController.saveCustomStatus
);

router.get(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  customStatusController.getCustomStatus
);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  customStatusController.updateCustomStatus
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  customStatusController.deleteCustomStatus
);

export default router;
