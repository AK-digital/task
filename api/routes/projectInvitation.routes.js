import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as projectInvitationControllers from "../controllers/projectInvitation.controllers.js";

router.get(
  "/:projectId",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]),
  projectInvitationControllers.getProjectInvitations
);

router.patch(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  projectInvitationControllers.updateRoleUserInvitation
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  projectInvitationControllers.deleteProjectInvitation
);

export default router;
