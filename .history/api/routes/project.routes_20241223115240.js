import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectControllers from "../controllers/project.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  projectControllers.saveProject
);

router.get("/", authMiddlewares.auth, projectControllers.getProjects);
router.get("/:id", authMiddlewares.auth, projectControllers.getProject);

router.put("/:id", authMiddlewares.auth, projectControllers.updateProject);

router.delete("/:id", authMiddlewares.auth, projectControllers.deleteProject);

// Guest invitation logic
router.post(
  "/send-invitation",
  authMiddlewares.auth,
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
  projectControllers.removeGuest
);

export default router;
