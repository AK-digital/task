import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as templateControllers from "../controllers/template.controllers.js";

router.post("/", authMiddlewares.auth, templateControllers.saveTemplate);
router.post("/use/:id", authMiddlewares.auth, templateControllers.useTemplate);

router.get("/", authMiddlewares.auth, templateControllers.getTemplates);

router.put("/:id", authMiddlewares.auth, templateControllers.updateTemplate);

router.delete("/:id", authMiddlewares.auth, templateControllers.deleteTemplate);

export default router;
