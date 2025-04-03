import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as projectControllers from "../controllers/project.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

router.post("/", authMiddlewares.auth, projectControllers.saveProject);

router.get("/", authMiddlewares.auth, projectControllers.getProjects);

router.get(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]),
  projectControllers.getProject
);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  upload.single("logo"),
  projectControllers.updateProject
);

router.patch(
  "/:id/logo",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  upload.single("logo"),
  projectControllers.updateProjectLogo
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner"]),
  projectControllers.deleteProject
);

// Guest invitation logic
router.post(
  "/:id/send-invitation",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  projectControllers.sendProjectInvitationToGuest
);

router.patch(
  "/accept-invitation",
  authMiddlewares.hasAccount,
  authMiddlewares.auth,
  projectControllers.acceptProjectInvitation
);

router.patch(
  "/:id/remove-guest",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  projectControllers.removeGuest
);

router.patch(
  "/reorder",
  authMiddlewares.auth,
  projectControllers.updateProjectsOrder
);

export default router;
