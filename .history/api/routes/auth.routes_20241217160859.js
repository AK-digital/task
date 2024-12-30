import express from "express";
const router = express.Router();
import * as authControllers from "../controllers/auth.controllers.js";

router.post("/sign-up", authControllers.signUp);

export default router;

