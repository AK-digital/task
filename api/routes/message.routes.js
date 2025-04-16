import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as reponseControllers from "../controllers/message.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  reponseControllers.saveMessage
);

router.get(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]), // projectId query is required
  reponseControllers.getMessages
);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  reponseControllers.updateMessage
);

router.patch(
  "/:id/read",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]),
  reponseControllers.updateReadBy
);

router.patch(
  "/:id/reaction",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  reponseControllers.updateReactions
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  reponseControllers.deleteMessage
);

export default router;
