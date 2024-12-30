import express from "express";
import * as authControllers from "../controllers/auth.controllers";
const router = express.Router();


router.post("/sign-up", authControllers.signUp)

export default router

