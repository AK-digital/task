import express from "express";
import {
  createSubtask,
  getSubtasks,
  updateSubtask,
  updateSubtaskStatus,
  updateSubtaskPriority,
  updateSubtaskDeadline,
  updateSubtaskEstimate,
  updateSubtaskDescription,
  addSubtaskResponsible,
  removeSubtaskResponsible,
  deleteSubtask,
  reorderSubtasks,
} from "../controllers/subtask.controllers.js";
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import SubtaskModel from "../models/Subtask.model.js";

const router = express.Router();

// Middleware pour récupérer le projectId via la sous-tâche
const getProjectIdFromSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const subtask = await SubtaskModel.findById(subtaskId).populate('taskId');
    
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }
    
    req.query.projectId = subtask.taskId.projectId;
    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Erreur lors de la récupération de la sous-tâche",
    });
  }
};

// Créer une sous-tâche
router.post("/task/:taskId", authMiddlewares.auth, checkRole(["owner", "manager", "team", "customer"]), createSubtask);

// Récupérer les sous-tâches d'une tâche
router.get("/task/:taskId", authMiddlewares.auth, getSubtasks);

// Mettre à jour une sous-tâche
router.put("/:subtaskId", authMiddlewares.auth, updateSubtask);

// Mettre à jour le statut d'une sous-tâche
router.patch("/:subtaskId/status", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team"]), updateSubtaskStatus);

// Mettre à jour la priorité d'une sous-tâche
router.patch("/:subtaskId/priority", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team"]), updateSubtaskPriority);

// Mettre à jour la deadline d'une sous-tâche
router.patch("/:subtaskId/deadline", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team"]), updateSubtaskDeadline);

// Mettre à jour l'estimation d'une sous-tâche
router.patch("/:subtaskId/estimate", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team"]), updateSubtaskEstimate);

// Mettre à jour la description d'une sous-tâche
router.patch("/:subtaskId/description", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team", "customer"]), updateSubtaskDescription);

// Ajouter un responsable à une sous-tâche
router.patch("/:subtaskId/add-responsible", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team"]), addSubtaskResponsible);

// Supprimer un responsable d'une sous-tâche
router.patch("/:subtaskId/remove-responsible", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team"]), removeSubtaskResponsible);

// Supprimer une sous-tâche
router.delete("/:subtaskId", authMiddlewares.auth, getProjectIdFromSubtask, checkRole(["owner", "manager", "team"]), deleteSubtask);

// Réorganiser les sous-tâches
router.put("/task/:taskId/reorder", authMiddlewares.auth, reorderSubtasks);

export default router;
