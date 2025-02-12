import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as projectControllers from "../controllers/project.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

router.post("/", authMiddlewares.auth, projectControllers.saveProject);

router.get("/", authMiddlewares.auth, projectControllers.getProjects);

router.get(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  projectControllers.getProject
);

router.put(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  projectControllers.updateProject
);

router.patch(
  "/:id/logo",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  upload.single("logo"),
  projectControllers.updateProjectLogo
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthor,
  projectControllers.deleteProject
);

// Guest invitation logic
router.post(
  "/:id/send-invitation",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
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
  projectMiddlewares.isAuthor,
  projectControllers.removeGuest
);

router.patch(
  "/reorder",
  authMiddlewares.auth,
  projectControllers.updateProjectsOrder
);

export default router;
