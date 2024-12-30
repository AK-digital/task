import express from "express";
const router = express.Router();

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
router.delete(
  "/:id",
  authMiddlewares.auth,
  authMiddlewares.authorize,
  userControllers.deleteUser
);
