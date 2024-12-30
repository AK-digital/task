import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectControllers from "../controllers/project.controllers.js";

router.post("/", projectControllers.saveProject);
router.get(
  "/:name",

  projectControllers.getProject
);

export default router;
