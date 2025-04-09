import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as boardTemplateControllers from "../controllers/boardTemplate.controllers.js";

router.get(
  "/",
  authMiddlewares.auth,
  boardTemplateControllers.getBoardsTemplates
);

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager"]),
  boardTemplateControllers.saveBoardTemplate
);

router.post(
  "/use/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  boardTemplateControllers.useBoardTemplate
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  boardTemplateControllers.deleteBoardTemplate
);

export default router;
