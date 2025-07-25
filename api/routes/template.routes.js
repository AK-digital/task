import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as templateControllers from "../controllers/template.controllers.js";

router.get("/", templateControllers.getPublicTemplates);
router.get("/user-private", templateControllers.getUserPrivateTemplates);

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

router.post(
  "/use/custom",
  authMiddlewares.auth,
  templateControllers.useCustomTemplate
);

router.put("/:id", authMiddlewares.auth, templateControllers.updateTemplate);
router.patch("/private/:id", authMiddlewares.auth, templateControllers.updateTemplateVisibility);

router.delete("/:id", authMiddlewares.auth, templateControllers.deleteTemplate);

export default router;
