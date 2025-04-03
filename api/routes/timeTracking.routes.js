import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as timeTrackingControllers from "../controllers/timeTracking.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]),
  timeTrackingControllers.saveTimeTracking
);

router.get(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]),
  timeTrackingControllers.getTimeTrackings
);

router.post(
  "/start",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]),
  timeTrackingControllers.startTimer
);

router.patch(
  "/stop/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]),
  timeTrackingControllers.stopTimer
);

router.delete(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]),
  timeTrackingControllers.deleteTimeTracking
);

export default router;
