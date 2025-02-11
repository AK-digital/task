import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as projectInvitationControllers from "../controllers/projectInvitation.controllers.js";

router.get(
  "/:projectId",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  projectInvitationControllers.getProjectInvitations
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthor,
  projectInvitationControllers.deleteProjectInvitation
);

export default router;
