import MilestoneModel from "../models/Milestone.model.js";
import BoardModel from "../models/Board.model.js";
import TaskModel from "../models/Task.model.js";

// Fonction utilitaire pour recalculer les statistiques d'un jalon
async function calculateMilestoneStats(milestoneId) {
  const boards = await BoardModel.find({ milestoneId }).lean();
  const boardIds = boards.map(board => board._id);
  
  const tasks = await TaskModel.find({ 
    boardId: { $in: boardIds },
    archived: false 
  }).lean();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => 
    task.status && task.status.toString() === "completed"
  ).length;

  const tasksWithDeadlines = tasks.filter(task => task.deadline);
  const latestDeadline = tasksWithDeadlines.length > 0 
    ? new Date(Math.max(...tasksWithDeadlines.map(task => new Date(task.deadline))))
    : null;

  const earliestStartDate = tasks.length > 0
    ? new Date(Math.min(...tasks.map(task => new Date(task.createdAt))))
    : null;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    boardsCount: boards.length,
    totalTasks,
    completedTasks,
    progress,
    startDate: earliestStartDate,
    endDate: latestDeadline,
    boards: boards.map(board => ({
      _id: board._id.toString(),
      title: board.title,
      color: board.color
    }))
  };
}

// Fonction pour recalculer les statistiques de tous les jalons d'un projet
export async function recalculateProjectMilestones(projectId) {
  try {
    const milestones = await MilestoneModel.find({ projectId }).lean();
    
    for (const milestone of milestones) {
      await calculateMilestoneStats(milestone._id);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors du recalcul des jalons:", error);
    return false;
  }
}

// Récupérer tous les jalons d'un projet avec leurs statistiques calculées
export async function getMilestones(req, res, next) {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const milestones = await MilestoneModel.find({ projectId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Calculer les statistiques pour chaque jalon
    const milestonesWithStats = await Promise.all(
      milestones.map(async (milestone) => {
        const stats = await calculateMilestoneStats(milestone._id);
        
        return {
          _id: milestone._id.toString(),
          name: milestone.name,
          description: milestone.description,
          projectId: milestone.projectId.toString(),
          color: milestone.color,
          order: milestone.order,
          status: milestone.status,
          createdAt: new Date(milestone.createdAt).toISOString(),
          updatedAt: new Date(milestone.updatedAt).toISOString(),
          // Statistiques calculées
          ...stats,
          startDate: stats.startDate ? stats.startDate.toISOString() : null,
          endDate: stats.endDate ? stats.endDate.toISOString() : null,
        };
      })
    );

    return res.status(200).send({
      success: true,
      data: milestonesWithStats,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des jalons:", err);
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Créer un nouveau jalon
export async function saveMilestone(req, res, next) {
  try {
    const { projectId, name, description, color } = req.body;

    if (!projectId || !name) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    // Obtenir le prochain ordre
    const lastMilestone = await MilestoneModel.findOne({ projectId })
      .sort({ order: -1 })
      .lean();
    const nextOrder = lastMilestone ? lastMilestone.order + 1 : 0;

    const newMilestone = new MilestoneModel({
      name,
      description,
      projectId,
      color: color || "#3b82f6",
      order: nextOrder,
    });

    const savedMilestone = await newMilestone.save();

    // Convertir en objet plain pour éviter les problèmes de sérialisation
    const plainMilestone = {
      _id: savedMilestone._id.toString(),
      name: savedMilestone.name,
      description: savedMilestone.description,
      projectId: savedMilestone.projectId.toString(),
      color: savedMilestone.color,
      order: savedMilestone.order,
      status: savedMilestone.status,
      createdAt: savedMilestone.createdAt.toISOString(),
      updatedAt: savedMilestone.updatedAt.toISOString(),
      // Statistiques initiales
      boardsCount: 0,
      totalTasks: 0,
      completedTasks: 0,
      progress: 0,
      startDate: null,
      endDate: null,
      boards: []
    };

    return res.status(201).send({
      success: true,
      message: "Jalon créé avec succès",
      data: plainMilestone,
    });
  } catch (err) {
    console.error("Erreur lors de la création du jalon:", err);
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Mettre à jour un jalon
export async function updateMilestone(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, color, status } = req.body;

    const updatedMilestone = await MilestoneModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(color && { color }),
          ...(status && { status }),
        },
      },
      { new: true, lean: true }
    );

    if (!updatedMilestone) {
      return res.status(404).send({
        success: false,
        message: "Jalon introuvable",
      });
    }

    // Recalculer les statistiques après mise à jour
    const stats = await calculateMilestoneStats(updatedMilestone._id);

    const plainMilestone = {
      _id: updatedMilestone._id.toString(),
      name: updatedMilestone.name,
      description: updatedMilestone.description,
      projectId: updatedMilestone.projectId.toString(),
      color: updatedMilestone.color,
      order: updatedMilestone.order,
      status: updatedMilestone.status,
      createdAt: new Date(updatedMilestone.createdAt).toISOString(),
      updatedAt: new Date(updatedMilestone.updatedAt).toISOString(),
      // Statistiques recalculées
      ...stats,
      startDate: stats.startDate ? stats.startDate.toISOString() : null,
      endDate: stats.endDate ? stats.endDate.toISOString() : null,
    };

    return res.status(200).send({
      success: true,
      message: "Jalon mis à jour avec succès",
      data: plainMilestone,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Supprimer un jalon
export async function deleteMilestone(req, res, next) {
  try {
    const { id } = req.params;

    // Vérifier si des boards sont assignés à ce jalon
    const boardsCount = await BoardModel.countDocuments({ milestoneId: id });
    
    if (boardsCount > 0) {
      // Désassigner les boards de ce jalon
      await BoardModel.updateMany(
        { milestoneId: id },
        { $unset: { milestoneId: 1 } }
      );
    }

    const deletedMilestone = await MilestoneModel.findByIdAndDelete(id);

    if (!deletedMilestone) {
      return res.status(404).send({
        success: false,
        message: "Jalon introuvable",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Jalon supprimé avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Assigner un board à un jalon
export async function assignBoardToMilestone(req, res, next) {
  try {
    const { boardId, milestoneId } = req.body;

    if (!boardId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedBoard = await BoardModel.findByIdAndUpdate(
      boardId,
      {
        $set: {
          milestoneId: milestoneId || null,
        },
      },
      { new: true, lean: true }
    );

    if (!updatedBoard) {
      return res.status(404).send({
        success: false,
        message: "Tableau introuvable",
      });
    }

    // Convertir en objet plain pour éviter les problèmes de sérialisation
    const plainBoard = JSON.parse(JSON.stringify(updatedBoard));
    plainBoard._id = updatedBoard._id.toString();
    plainBoard.projectId = updatedBoard.projectId.toString();
    if (plainBoard.milestoneId) {
      plainBoard.milestoneId = updatedBoard.milestoneId.toString();
    }
    plainBoard.createdAt = new Date(plainBoard.createdAt).toISOString();
    plainBoard.updatedAt = new Date(plainBoard.updatedAt).toISOString();

    return res.status(200).send({
      success: true,
      message: "Tableau assigné avec succès",
      data: plainBoard,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Réorganiser les jalons
export async function reorderMilestones(req, res, next) {
  try {
    const { milestones } = req.body;

    if (!milestones || !Array.isArray(milestones)) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    // Mettre à jour l'ordre de chaque jalon
    const updatePromises = milestones.map((milestone, index) =>
      MilestoneModel.findByIdAndUpdate(
        milestone.id,
        { $set: { order: index } },
        { new: true, lean: true }
      )
    );

    await Promise.all(updatePromises);

    return res.status(200).send({
      success: true,
      message: "Ordre des jalons mis à jour avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
