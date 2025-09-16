import SubtaskModel from "../models/Subtask.model.js";
import TaskModel from "../models/Task.model.js";

// Créer une sous-tâche
export async function createSubtask(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { taskId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).send({
        success: false,
        message: "Le titre de la sous-tâche est requis",
      });
    }

    // Vérifier que la tâche parent existe
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Tâche parent non trouvée",
      });
    }

    // Compter les sous-tâches existantes pour définir l'ordre
    const subtaskCount = await SubtaskModel.countDocuments({ taskId });

    // Récupérer les statuts et priorités par défaut du projet
    const StatusModel = (await import("../models/Status.model.js")).default;
    const PriorityModel = (await import("../models/Priority.model.js")).default;
    
    const defaultStatus = await StatusModel.findOne({
      projectId: task.projectId,
      status: "waiting"
    });
    
    const defaultPriority = await PriorityModel.findOne({
      projectId: task.projectId,
      priority: "medium"
    });

    const newSubtask = new SubtaskModel({
      taskId,
      author: authUser._id,
      title: title.trim(),
      order: subtaskCount,
      status: defaultStatus?._id,
      priority: defaultPriority?._id,
    });

    const savedSubtask = await newSubtask.save();
    
    // Populer l'auteur pour la réponse
    await savedSubtask.populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" },
      { path: "timeTrackings" },
      { path: "messages" },
      { path: "description.author", select: "firstName lastName picture" }
    ]);

    return res.status(201).send({
      success: true,
      message: "Sous-tâche créée avec succès",
      data: savedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Récupérer les sous-tâches d'une tâche
export async function getSubtasks(req, res, next) {
  try {
    const { taskId } = req.params;

    // Vérifier que la tâche parent existe
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Tâche parent non trouvée",
      });
    }

    const subtasks = await SubtaskModel.find({ taskId })
      .sort({ order: 1 })
      .populate([
        { path: "author", select: "firstName lastName picture" },
        { path: "completedBy", select: "firstName lastName picture" },
        { path: "status" },
        { path: "priority" },
        { path: "responsibles", select: "firstName lastName picture" },
        { path: "timeTrackings" },
        { path: "messages" },
        { path: "description.author", select: "firstName lastName picture" },
      ]);

    return res.status(200).send({
      success: true,
      message: "Sous-tâches récupérées avec succès",
      data: subtasks,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Mettre à jour une sous-tâche
export async function updateSubtask(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { subtaskId } = req.params;
    const { title, completed } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    const updateData = {};
    
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).send({
          success: false,
          message: "Le titre ne peut pas être vide",
        });
      }
      updateData.title = title.trim();
    }

    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date();
        updateData.completedBy = authUser._id;
      } else {
        updateData.completedAt = null;
        updateData.completedBy = null;
      }
    }

    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      updateData,
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" },
      { path: "timeTrackings" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Sous-tâche mise à jour avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Supprimer une sous-tâche
export async function deleteSubtask(req, res, next) {
  try {
    const { subtaskId } = req.params;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    await SubtaskModel.findByIdAndDelete(subtaskId);

    // Réorganiser l'ordre des sous-tâches restantes
    const remainingSubtasks = await SubtaskModel.find({ taskId: subtask.taskId })
      .sort({ order: 1 });

    const bulkOps = remainingSubtasks.map((sub, index) => ({
      updateOne: {
        filter: { _id: sub._id },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await SubtaskModel.bulkWrite(bulkOps);
    }

    return res.status(200).send({
      success: true,
      message: "Sous-tâche supprimée avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Mettre à jour le statut d'une sous-tâche
export async function updateSubtaskStatus(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const { statusId } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      { status: statusId },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Statut de la sous-tâche mis à jour avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Mettre à jour la priorité d'une sous-tâche
export async function updateSubtaskPriority(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const { priorityId } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      { priority: priorityId },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Priorité de la sous-tâche mise à jour avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Mettre à jour la deadline d'une sous-tâche
export async function updateSubtaskDeadline(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const { deadline } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      { deadline: deadline },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Deadline de la sous-tâche mise à jour avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Mettre à jour l'estimation d'une sous-tâche
export async function updateSubtaskEstimate(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const { estimation } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    // Stocker l'estimation comme une chaîne (même comportement que les tâches)
    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      { estimation: estimation },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Estimation de la sous-tâche mise à jour avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Ajouter un responsable à une sous-tâche
export async function addSubtaskResponsible(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const { responsibleId } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    // Vérifier si le responsable n'est pas déjà ajouté
    if (subtask.responsibles.includes(responsibleId)) {
      return res.status(400).send({
        success: false,
        message: "Ce responsable est déjà assigné à cette sous-tâche",
      });
    }

    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      { $push: { responsibles: responsibleId } },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Responsable ajouté à la sous-tâche avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Supprimer un responsable d'une sous-tâche
export async function removeSubtaskResponsible(req, res, next) {
  try {
    const { subtaskId } = req.params;
    const { responsibleId } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      { $pull: { responsibles: responsibleId } },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Responsable supprimé de la sous-tâche avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Mettre à jour la description d'une sous-tâche
export async function updateSubtaskDescription(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { subtaskId } = req.params;
    const { description, taggedUsers = [], attachments = [] } = req.body;

    const subtask = await SubtaskModel.findById(subtaskId);
    if (!subtask) {
      return res.status(404).send({
        success: false,
        message: "Sous-tâche non trouvée",
      });
    }

    // Créer la structure de description similaire aux tâches
    const descriptionData = {
      author: authUser._id,
      text: description || "",
      createdAt: subtask.description?.createdAt || new Date(),
      updatedAt: new Date(),
      reactions: subtask.description?.reactions || [],
      files: attachments || subtask.description?.files || [],
    };

    const updatedSubtask = await SubtaskModel.findByIdAndUpdate(
      subtaskId,
      { description: descriptionData },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName picture" },
      { path: "completedBy", select: "firstName lastName picture" },
      { path: "status" },
      { path: "priority" },
      { path: "responsibles", select: "firstName lastName picture" },
      { path: "description.author", select: "firstName lastName picture" }
    ]);

    return res.status(200).send({
      success: true,
      message: "Description de la sous-tâche mise à jour avec succès",
      data: updatedSubtask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Réorganiser les sous-tâches
export async function reorderSubtasks(req, res, next) {
  try {
    const { taskId } = req.params;
    const { subtasks } = req.body;

    if (!subtasks || !Array.isArray(subtasks)) {
      return res.status(400).send({
        success: false,
        message: "Liste des sous-tâches invalide",
      });
    }

    // Vérifier que la tâche parent existe
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Tâche parent non trouvée",
      });
    }

    const bulkOps = subtasks.map((subtask, index) => ({
      updateOne: {
        filter: { _id: subtask._id, taskId },
        update: { $set: { order: index } },
      },
    }));

    await SubtaskModel.bulkWrite(bulkOps);

    return res.status(200).send({
      success: true,
      message: "Ordre des sous-tâches mis à jour avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
