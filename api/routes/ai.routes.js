import express from "express";
import { generateBoard } from "../controllers/ai.controllers.js";

const router = express.Router();

// Génération de tâches par IA
router.post("/generate-board", generateBoard);

export default router; 