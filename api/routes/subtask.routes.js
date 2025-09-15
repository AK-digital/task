import express from "express";
import {
  createSubtask,
  getSubtasks,
  updateSubtask,
  updateSubtaskStatus,
  updateSubtaskPriority,
  updateSubtaskDeadline,
  updateSubtaskEstimate,
  addSubtaskResponsible,
  removeSubtaskResponsible,
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

// Mettre à jour le statut d'une sous-tâche
router.patch("/:subtaskId/status", authMiddlewares.auth, updateSubtaskStatus);

// Mettre à jour la priorité d'une sous-tâche
router.patch("/:subtaskId/priority", authMiddlewares.auth, updateSubtaskPriority);

// Mettre à jour la deadline d'une sous-tâche
router.patch("/:subtaskId/deadline", authMiddlewares.auth, updateSubtaskDeadline);

// Mettre à jour l'estimation d'une sous-tâche
router.patch("/:subtaskId/estimate", authMiddlewares.auth, updateSubtaskEstimate);

// Ajouter un responsable à une sous-tâche
router.patch("/:subtaskId/add-responsible", authMiddlewares.auth, addSubtaskResponsible);

// Supprimer un responsable d'une sous-tâche
router.patch("/:subtaskId/remove-responsible", authMiddlewares.auth, removeSubtaskResponsible);

// Supprimer une sous-tâche
router.delete("/:subtaskId", authMiddlewares.auth, deleteSubtask);

// Réorganiser les sous-tâches
router.put("/task/:taskId/reorder", authMiddlewares.auth, reorderSubtasks);

export default router;
