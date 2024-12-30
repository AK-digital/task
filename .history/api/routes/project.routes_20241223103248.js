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

export default router;
