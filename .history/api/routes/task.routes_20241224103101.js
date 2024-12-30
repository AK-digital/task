import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares";

router.post("/");

router.get("/");

router.update("/");

router.delete("/");

router.patch("/");
router.patch("/");

export default router;
