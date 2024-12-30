import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as userControllers from "../controllers/user.controllers.js";

router.post("/sign-up", authControllers.signUp);
router.post("/sign-in", authControllers.signIn);
router.post("/refresh-access-token", authControllers.refreshAccessToken);
router.post("/logout", authMiddlewares.auth, authControllers.logout);

export default router;
