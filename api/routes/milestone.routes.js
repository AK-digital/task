import express from "express";
import {
  getMilestones,
  saveMilestone,
  updateMilestone,
  deleteMilestone,
  assignBoardToMilestone,
  reorderMilestones,
  recalculateProjectMilestones,
} from "../controllers/milestone.controllers.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import { auth } from "../middlewares/jwt.middlewares.js";

const router = express.Router();

// Récupérer les jalons d'un projet
router.get("/", auth, checkRole(["owner", "manager", "team", "customer", "guest"]), getMilestones);

// Créer un nouveau jalon (manager+)
router.post("/", auth, checkRole(["owner", "manager"]), saveMilestone);

// Mettre à jour un jalon (manager+)
router.put("/:id", auth, checkRole(["owner", "manager"]), updateMilestone);

// Supprimer un jalon (manager+)
router.delete("/:id", auth, checkRole(["owner", "manager"]), deleteMilestone);

// Assigner un board à un jalon (manager+)
router.patch("/assign-board", auth, checkRole(["owner", "manager"]), assignBoardToMilestone);

// Réorganiser les jalons (manager+)
router.patch("/reorder", auth, checkRole(["owner", "manager"]), reorderMilestones);

// Recalculer les statistiques des jalons d'un projet (manager+)
router.patch("/recalculate", auth, checkRole(["owner", "manager"]), async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const success = await recalculateProjectMilestones(projectId);
    
    if (success) {
      return res.status(200).send({
        success: true,
        message: "Statistiques des jalons recalculées avec succès",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Erreur lors du recalcul des statistiques",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message || "Une erreur inattendue est survenue",
    });
  }
});

export default router;
