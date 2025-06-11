import { Router } from "express";
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as feedbackController from "../controllers/feedback.controllers.js";

const router = Router();

router.post("/", authMiddlewares.auth, feedbackController.saveFeedback);

export default router;
