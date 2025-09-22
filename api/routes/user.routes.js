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

router.get(
  "/email-change/:token",
  userControllers.validateEmailChange
);

router.patch(
  "/:id/picture",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  upload.single("picture"),
  userControllers.updatePicture
);
// Routes pour la gestion des utilisateurs par les super admins
router.get(
  "/admin/all",
  authMiddlewares.auth,
  userControllers.getAllUsersForAdmin
);

router.patch(
  "/admin/:userId/toggle-verification",
  authMiddlewares.auth,
  userControllers.toggleUserVerification
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  userControllers.deleteUser
);

export default router;
