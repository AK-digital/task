import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as boardControllers from "../controllers/board.controllers.js";

router.post("/", authMiddlewares.auth, boardControllers.saveBoard);

export default router;
