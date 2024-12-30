import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as projectControllers from "../controllers/project.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  projectControllers.saveProject
);

router.get("/", authMiddlewares.auth, projectControllers.getProjects);

router.get(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests, // projectId query is required
  projectControllers.getProject
);

router.put(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests, // projectId query is required
  projectControllers.updateProject
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthor, // projectId query is required
  projectControllers.deleteProject
);

// Guest invitation logic
router.post(
  "/:id/send-invitation",
  authMiddlewares.auth,
  projectMiddlewares.isAuthor, // projectId query is required
  projectControllers.sendProjectInvitationToGuest
);

router.patch(
  "/accept-invitation",
  authMiddlewares.auth,
  projectControllers.acceptProjectInvitation
);

router.patch(
  "/:id/remove-guest",
  authMiddlewares.auth,
  projectMiddlewares.isAuthor, // projectId query is required
  projectControllers.removeGuest
);

export default router;
