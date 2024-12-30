import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as taskControllers from "../controllers/task.controllers.js";

router.post("/");

router.get("/");

router.update("/");

router.delete("/:id");

router.patch("/");
router.patch("/");

export default router;
