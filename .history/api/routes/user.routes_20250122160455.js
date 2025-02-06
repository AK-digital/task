import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as userControllers from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

router.get(
  "/",
  authMiddlewares.auth,
  authMiddlewares.isAdmin,
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

router.patch(
  "/:id",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  upload.single("picture"),
  userControllers.updateUser
);
router.delete(
  "/:id",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  userControllers.deleteUser
);

export default router;
