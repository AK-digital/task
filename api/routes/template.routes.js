import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as templateControllers from "../controllers/template.controllers.js";

router.post("/", authMiddlewares.auth, templateControllers.saveTemplate);

router.post(
  "/board",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  templateControllers.saveBoardTemplate
);

router.post(
  "/use/project/:id",
  authMiddlewares.auth,
  templateControllers.useTemplate
);
router.post(
  "/use/board/:id",
  authMiddlewares.auth,
  templateControllers.useBoardTemplate
);

router.get("/", authMiddlewares.auth, templateControllers.getTemplates);

router.put("/:id", authMiddlewares.auth, templateControllers.updateTemplate);

router.delete("/:id", authMiddlewares.auth, templateControllers.deleteTemplate);

export default router;
