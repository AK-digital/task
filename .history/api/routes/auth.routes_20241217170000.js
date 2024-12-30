import express from "express";
const router = express.Router();
import * as authControllers from "../controllers/auth.controllers.js";

router.post("/sign-up", authControllers.signUp);
router.post("/sign-in", authControllers.signIn);

export default router;

