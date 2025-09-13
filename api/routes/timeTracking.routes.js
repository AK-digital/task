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

router.get("/", authMiddlewares.auth, timeTrackingControllers.getTimeTrackings);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  timeTrackingControllers.updateTimeTrackingText
);

router.put(
  "/:id/time",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  timeTrackingControllers.updateTimeTracking
);

router.post(
  "/start",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  timeTrackingControllers.startTimer
);

router.patch(
  "/stop/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  timeTrackingControllers.stopTimer
);

router.delete(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  timeTrackingControllers.deleteTimeTracking
);

router.patch(
  "/:id/billable",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  timeTrackingControllers.updateTimeTrackingBillable
);

export default router;
