import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as userControllers from "../controllers/user.controllers.js";

router.delete("/:id", authMiddlewares.auth, authControllers.logout);

export default router;
