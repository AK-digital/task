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

  console.log(moment.utc(startTime).subtract(2, "hours").format());
  const newTimeTracking = new TimeTrackingModel({
    userId: authUser._id,
    projectId: req.query.projectId,
    taskId: taskId,
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
    const projectId = req.query.projectId;
    const userId = req.query.userId;
    const startingDate = req.query.startingDate;
    const endingDate = req.query.endingDate;

    console.log(projectId.split(" "));

    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const filters = {};

    if (projectId) {
      filters.projectId = { $in: projectId.split(" ") };
    }

    if (userId) {
      filters.userId = { $in: userId.split(" ") };
    }

    if (startingDate) {
      const startDate = new Date(startingDate);
      startDate.setHours(0, 0, 0, 0); // Set to beginning of the day

      let endDate;
      if (endingDate) {
        endDate = new Date(endingDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
      } else {
        endDate = new Date(); // Current time
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
      }

      filters.startTime = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (!startingDate && endingDate) {
      let endDate = new Date(endingDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of the day

      filters.startTime = {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Beginning of the day
        $lte: endDate, // End of the day
      };
    }

    const timeTrackings = await TimeTrackingModel.find(filters)
      .populate("projectId", "_id author guests")
      .populate("userId", "_id firstName lastName picture")
      .populate("taskId", "_id text projectId")
      .exec();

    if (timeTrackings.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun temps de suivi trouvé",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Liste des temps de suivi du projet retrouvé avec succès",
      data: timeTrackings,
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

    const newTimeTracking = new TimeTrackingModel({
      userId: authUser._id,
      projectId: req.query.projectId,
      taskId: taskId,
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
