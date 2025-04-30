import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as messageControllers from "../controllers/message.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  messageControllers.saveMessage
);

router.get(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]), // projectId query is required
  messageControllers.getMessages
);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  messageControllers.updateMessage
);

router.patch(
  "/:id/read",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]),
  messageControllers.updateReadBy
);

router.patch(
  "/:id/reaction",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  messageControllers.updateReactions
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  messageControllers.deleteMessage
);

export default router;
