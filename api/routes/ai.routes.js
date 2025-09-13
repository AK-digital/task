import express from "express";
import { generateBoard, getUsage, testLimit, resetUsage } from "../controllers/ai.controllers.js";
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";

const router = express.Router();

// Génération de tâches par IA (authentification requise)
router.post("/generate-board", authMiddlewares.auth, generateBoard);

// Récupération de l'utilisation quotidienne (authentification requise)
router.get("/usage", authMiddlewares.auth, getUsage);

// Routes de test (authentification requise)
router.post("/test-limit", authMiddlewares.auth, testLimit);
router.delete("/reset-usage", authMiddlewares.auth, resetUsage);

export default router; 