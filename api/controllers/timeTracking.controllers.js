import mongoose from "mongoose";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";
import TimeTrackingModel from "../models/TimeTracking.model.js";
import moment from "moment";

export async function saveTimeTracking(req, res, next) {
  const authUser = res.locals.user;
  const { taskId, startTime, endTime } = req.body;

  if (!taskId || !startTime || !endTime) {
    return res.status(400).send({
      success: false,
      message: "Paramètres manquants",
    });
  }

  const task = await TaskModel.findById({ _id: taskId });

  if (!task) {
    return res.status(404).send({
      success: false,
      message: "Aucune tâche trouvée",
    });
  }

  const newTimeTracking = new TimeTrackingModel({
    userId: authUser._id,
    projectId: req.query.projectId,
    taskId: taskId,
    taskText: task.text,
    startTime: moment.utc(startTime).subtract(2, "hours").format(),
    endTime: moment.utc(endTime).subtract(2, "hours").format(),
    duration: new Date(endTime) - new Date(startTime),
  });

  await newTimeTracking.save();

  await TaskModel.findByIdAndUpdate(
    { _id: taskId },
    {
      $addToSet: { timeTrackings: newTimeTracking?._id },
    },
    {
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const populatedTimeTracking = await TimeTrackingModel.findById({
    _id: newTimeTracking._id,
  }).populate("userId", "_id firstName lastName picture");

  return res.status(200).send({
    success: true,
    message: "Le temps de suivi a été enregistré",
    data: populatedTimeTracking,
  });
}

export async function getTimeTrackings(req, res, next) {
  try {
    const authUser = res.locals.user;

    const { projects, members, startingDate, endingDate } = req.query;

    const userProjects = await ProjectModel.find({
      "members.user": authUser?._id,
    }).select("_id name");

    if (userProjects.length === 0) {
      return res.status(200).send({
        success: true,
        message: "Aucun projet trouvé pour cet utilisateur",
        data: [],
      });
    }

    // Extraire les IDs et noms des projets de l'utilisateur
    const userProjectIds = userProjects.map((project) => project._id);

    const filters = {
      projectId: { $in: userProjectIds },
    };

    if (projects?.length > 0) {
      filters.projectId = { $in: projects?.split(",") };
    }

    if (members?.length > 0) {
      filters.userId = { $in: members?.split(",") };
    }

    if (startingDate) {
      filters.startTime = { $gte: startingDate };
    }

    if (endingDate) {
      filters.endTime = { $lte: endingDate };
    }

    const timeTrackings = await TimeTrackingModel.find(filters)
      .populate("userId", "_id firstName lastName picture")
      .populate("projectId", "_id name logo members")
      .populate("taskId")
      .exec();

    if (timeTrackings.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun temps de suivi trouvé",
        data: [],
      });
    }

    return res.status(200).send({
      success: true,
      message: "Liste des temps de suivi du projet retrouvé avec succès",
      data: timeTrackings,
    });
  } catch (err) {
    console.error("Erreur dans getTimeTrackings:", err);
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTimeTrackingText(req, res, next) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedTimeTracking = await TimeTrackingModel.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          taskText: text,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedTimeTracking) {
      return res.status(404).send({
        success: false,
        message: "Aucun temps de suivi trouvé",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Le texte de la tâche a été mis à jour",
      data: updatedTimeTracking,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function startTimer(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const task = await TaskModel.findById({ _id: taskId });

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Aucune tâche trouvée",
      });
    }

    const newTimeTracking = new TimeTrackingModel({
      userId: authUser._id,
      projectId: req.query.projectId,
      taskId: taskId,
      taskText: task.text,
      startTime: new Date(),
      isRunning: true,
    });

    await newTimeTracking.save();

    await TaskModel.findByIdAndUpdate(
      { _id: taskId },
      {
        $addToSet: { timeTrackings: newTimeTracking._id },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).send({
      success: true,
      message: "Le tracking du temps de la tâche commence",
      data: newTimeTracking,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function stopTimer(req, res, next) {
  try {
    const timeTracking = await TimeTrackingModel.findOne({
      userId: res.locals.user._id,
      taskId: req.params.id,
      isRunning: true, // Get only the running time tracking
    });

    if (!timeTracking) {
      return res.status(404).send({
        success: false,
        message: "Aucun temps de suivi trouvé",
      });
    }

    // Check if the time tracking is already stopped
    if (!timeTracking?.startTime && !timeTracking.isRunning) {
      return res.status(404).send({
        success: false,
        message: "Aucun suivi de temps en cours pour cette tâche",
      });
    }

    const updatedTimeTracking = await TimeTrackingModel.findOneAndUpdate(
      {
        userId: res.locals.user._id,
        taskId: req.params.id,
        isRunning: true,
      },
      {
        endTime: moment().format(),
        duration: new Date() - timeTracking.startTime, // Calculate the duration
        isRunning: false, // Very important to set the isRunning to false
      },
      { new: true, setDefaultsOnInsert: true }
    )
      .populate("userId", "_id firstName lastName picture")
      .exec();

    return res.status(200).send({
      success: true,
      message: "Le tracking du temps de la tâche est terminé",
      data: updatedTimeTracking,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function deleteTimeTracking(req, res, next) {
  try {
    const { trackersIds } = req.body;

    const deletedTimeTracking = await TimeTrackingModel.deleteMany({
      _id: { $in: trackersIds },
    });

    if (!deletedTimeTracking) {
      return res.status(404).send({
        success: false,
        message: "Aucun temps de suivi trouvé",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Le temps de suivi a été supprimé",
      data: deletedTimeTracking,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTimeTracking(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { startTime, endTime } = req.body;
    const timeTrackingId = req.params.id;

    if (!startTime || !endTime) {
      return res.status(400).send({
        success: false,
        message: "Les heures de début et de fin sont requises",
      });
    }

    // Vérifier que l'entrée de temps existe
    const existingTimeTracking = await TimeTrackingModel.findById(timeTrackingId);
    
    if (!existingTimeTracking) {
      return res.status(404).send({
        success: false,
        message: "Temps de suivi non trouvé",
      });
    }

    // Vérifier les permissions
    const project = await ProjectModel.findById(existingTimeTracking.projectId);
    const userMember = project.members.find(member => 
      member.user.toString() === authUser._id.toString()
    );

    // Le créateur peut toujours modifier sa propre entrée
    // Les managers/owners peuvent modifier toutes les entrées
    const isOwner = existingTimeTracking.userId.toString() === authUser._id.toString();
    const isManagerOrOwner = userMember && ['owner', 'manager'].includes(userMember.role);
    
    const canEdit = isOwner || isManagerOrOwner;

    if (!canEdit) {
      return res.status(403).send({
        success: false,
        message: "Vous n'avez pas les permissions pour modifier cette entrée",
      });
    }

    const updatedTimeTracking = await TimeTrackingModel.findByIdAndUpdate(
      timeTrackingId,
      {
        startTime: moment.utc(startTime).subtract(2, "hours").format(),
        endTime: moment.utc(endTime).subtract(2, "hours").format(),
        duration: new Date(endTime) - new Date(startTime),
      },
      { new: true }
    ).populate("userId", "_id firstName lastName picture");

    return res.status(200).send({
      success: true,
      message: "Temps de suivi mis à jour avec succès",
      data: updatedTimeTracking,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTimeTrackingBillable(req, res, next) {
  try {
    const { billable } = req.body;
    const timeTrackingId = req.params.id;

    if (billable === undefined) {
      return res.status(400).send({
        success: false,
        message: "Le statut facturable est requis",
      });
    }

    const updatedTimeTracking = await TimeTrackingModel.findByIdAndUpdate(
      timeTrackingId,
      { billable: billable },
      { new: true }
    );

    if (!updatedTimeTracking) {
      return res.status(404).send({
        success: false,
        message: "Temps de suivi non trouvé",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Statut facturable mis à jour avec succès",
      data: updatedTimeTracking,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
