import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as notificationControllers from "../controllers/notification.controllers.js";

router.get("/", authMiddlewares.auth, notificationControllers.getNotifications);

export default router;
