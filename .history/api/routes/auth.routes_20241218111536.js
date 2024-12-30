import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as authControllers from "../controllers/auth.controllers.js";

router.post("/sign-up", authMiddlewares.auth, authControllers.signUp);
router.post("/sign-in", authControllers.signIn);

export default router;
