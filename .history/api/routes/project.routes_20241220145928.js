import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectControllers from "../controllers/project.controllers.js";

router.post("/", projectControllers.saveProject);
router.get(
  "/:name",
  authMiddlewares.auth,
  authMiddlewares.isAdmin,
  userControllers.getUser
);
router.put(
  "/:id",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  userControllers.updateUser
);
router.delete(
  "/:id",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  userControllers.deleteUser
);

export default router;
