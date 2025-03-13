import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as notificationControllers from "../controllers/notification.controllers.js";

router.get("/", authMiddlewares.auth, notificationControllers.getNotifications);

router.patch(
  "/read/:id",
  authMiddlewares.auth,
  notificationControllers.readNotification
);

router.patch(
  "/read-all",
  authMiddlewares.auth,
  notificationControllers.readNotifications
);

export default router;
