import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as timeTrackingControllers from "../controllers/timeTracking.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  timeTrackingControllers.saveTimeTracking
);

router.get("/", authMiddlewares.auth, timeTrackingControllers.getTimeTrackings);

router.post(
  "/start",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  timeTrackingControllers.startTimer
);

router.patch(
  "/stop/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  timeTrackingControllers.stopTimer
);

router.delete(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  timeTrackingControllers.deleteTimeTracking
);

export default router;
