import { Router } from "express";
const router = Router();
import * as betaControllers from "../controllers/beta.controllers.js";

router.post("/", betaControllers.sendBetaRequest);
router.patch("/", betaControllers.confirmBetaRequest);

export default router;
