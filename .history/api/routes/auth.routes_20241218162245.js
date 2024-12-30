import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as authControllers from "../controllers/auth.controllers.js";
import passport from "p";

router.post("/sign-up", authControllers.signUp);
router.post("/sign-in", authControllers.signIn);
router.post("/refresh-access-token", authControllers.refreshAccessToken);
router.post("/logout", authMiddlewares.auth, authControllers.logout);

// Google auth

router.get("/google", authMiddlewares.auth, authControllers.logout);
router.get("/google/callback", authMiddlewares.auth, authControllers.logout);

export default router;
