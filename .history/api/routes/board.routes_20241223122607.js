import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as boardControllers from "../controllers/board.controllers.js";

export default router;
