import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectControllers from "../controllers/project.controllers.js";

router.post("/", projectControllers.saveProject);
router.get("/", authMiddlewares.auth, projectControllers.getProjects);
router.get("/:id", projectControllers.getProject);

export default router;
