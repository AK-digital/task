import express from "express";
import {
  createSubtask,
  getSubtasks,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks,
} from "../controllers/subtask.controllers.js";
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";

const router = express.Router();

// Créer une sous-tâche
router.post("/task/:taskId", authMiddlewares.auth, checkRole(["owner", "manager", "team", "customer"]), createSubtask);

// Récupérer les sous-tâches d'une tâche
router.get("/task/:taskId", authMiddlewares.auth, getSubtasks);

// Mettre à jour une sous-tâche
router.put("/:subtaskId", authMiddlewares.auth, updateSubtask);

// Supprimer une sous-tâche
router.delete("/:subtaskId", authMiddlewares.auth, deleteSubtask);

// Réorganiser les sous-tâches
router.put("/task/:taskId/reorder", authMiddlewares.auth, reorderSubtasks);

export default router;
