import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as templateControllers from "../controllers/template.controllers.js";

router.get("/", authMiddlewares.auth, templateControllers.getTemplates);

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  templateControllers.saveTemplate
);

router.post(
  "/use/project/:id",
  authMiddlewares.auth,
  templateControllers.useTemplate
);

router.put("/:id", authMiddlewares.auth, templateControllers.updateTemplate);

router.delete("/:id", authMiddlewares.auth, templateControllers.deleteTemplate);

export default router;
