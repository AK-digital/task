import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectControllers from "../controllers/user.controllers.js";

router.post(
  "/",

  userControllers.getUsers
);
router.get(
  "/:id",
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
