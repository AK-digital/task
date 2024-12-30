import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as taskControllers from "../controllers/task.controllers.js";

router.post("/");

router.get("/");

router.update("/:id");

router.delete("/:id");

router.patch("/:id/start-timer");
router.patch("/:id/end-timer");

export default router;
