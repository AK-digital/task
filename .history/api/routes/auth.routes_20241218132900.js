import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as authControllers from "../controllers/auth.controllers.js";

router.post("/sign-up", authControllers.signUp);
router.post("/sign-in", authControllers.signIn);
router.post("/refresh-access-token", authControllers.refreshAccessToken);

export default router;
