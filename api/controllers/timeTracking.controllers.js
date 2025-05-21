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

  console.log("task", task);

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

    const { projects, users, startingDate, endingDate } = req.query;

    const userProjects = await ProjectModel.find({
      members: authUser?._id,
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

    const pipeline = [
      {
        $match: {
          projectId: { $in: userProjectIds },
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "taskId",
          foreignField: "_id",
          as: "task",
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          fullName: {
            $concat: ["$user.firstName", " ", "$user.lastName"],
          },
        },
      },
    ];

    if (projects?.length > 0) {
      pipeline.push({
        $match: {
          "project.name": { $in: projects?.split(",") },
        },
      });
    }

    if (users?.length > 0) {
      pipeline.push({
        $match: {
          fullName: { $in: users?.split(",") },
        },
      });
    }

    if (startingDate || endingDate) {
      const matchStage = {};

      if (startingDate) {
        const startDate = new Date(startingDate);
        startDate.setHours(0, 0, 0, 0); // Set to beginning of the day
        matchStage.startTime = { $gte: startDate };
      }

      if (endingDate) {
        const endDate = new Date(endingDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
        matchStage.startTime = matchStage.startTime || {}; // Ensurer que l'objet existe
        matchStage.startTime.$lte = endDate;
      }

      // Ajout du filtre dans le pipeline
      pipeline.push({
        $match: matchStage,
      });
    }

    const timeTrackings = await TimeTrackingModel.aggregate(pipeline);

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
