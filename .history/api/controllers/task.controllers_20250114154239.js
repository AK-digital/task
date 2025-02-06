import { auth } from "../middlewares/jwt.middlewares.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";

// Only authors and guets will be able to post the tasks
export async function saveTask(req, res, next) {
  try {
    const authUser = res.locals.user;
    const projectId = req.query.projectId;
    const { boardId, text } = req.body;

    if (!boardId || !text) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const newTask = new TaskModel({
      author: authUser?._id,
      projectId: projectId,
      boardId: boardId,
      text: text,
    });

    const savedTask = await newTask.save();

    return res.status(201).send({
      success: true,
      message: "Tâche créée avec succès",
      data: savedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only authors and guets will be able to get the tasks
export async function getTasks(req, res, next) {
  try {
    const boardId = req.query.boardId;

    const tasks = await TaskModel.find({ boardId: boardId });

    if (tasks.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucune tâche trouvé dans ce tableau",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tâches trouvées",
      data: tasks,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only authors and guets will be able to update the tasks
export async function updateTask(req, res, next) {
  try {
    const { text, description, status, priority, deadline } = req.body;
    const medias = req.files["medias"];

    const allowedStatus = [
      "En cours",
      "En attente",
      "Terminée",
      "À faire",
      "Bloquée",
    ];

    if (!text && !description && !status && !priority && !deadline) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    if (status) {
      if (!allowedStatus.includes(status)) {
        return res.status(400).send({
          success: false,
          message: "Paramètres invalide",
        });
      }
    }

    const files = [];
    if (medias) {
      for (const media of medias) {
        files.push(media.filename);
      }
    }

    const updateFields = {};
    if (text) updateFields.text = text;
    if (description) updateFields.description = description;
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (deadline) updateFields.deadline = deadline;
    if (files.length > 0) updateFields.files = files; // If there is files then are updating the files field

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: updateFields,
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tâche modifié avec succès",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTaskStatus(req, res, next) {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "En cours",
      "En attente",
      "Terminée",
      "À faire",
      "Bloquée",
    ];

    if (!status) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    if (status) {
      if (!allowedStatus.includes(status)) {
        return res.status(400).send({
          success: false,
          message: "Paramètres invalide",
        });
      }
    }

    const updateFields = {};

    if (status) updateFields.status = status;

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: updateFields,
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tâche modifié avec succès",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// export async function addTaskFields(req, res, next) {
//   try {
//   } catch (error) {
//     return res.status(500).send({
//       success: false,
//       message: err.message || "Une erreur inattendue est survenue",
//     });
//   }
// }

// Only authors and guets will be able to delete the tasks
export async function deleteTask(req, res, next) {
  try {
    const deletedTask = await TaskModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedTask) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tâche supprimé avec succès",
      data: deletedTask,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function addResponsible(req, res, next) {
  try {
    const { responsibleId } = req.body;

    if (!responsibleId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const project = await ProjectModel.findById({ _id: req.query.projectId });

    if (
      project.author.toString() !== responsibleId &&
      !project.guests.includes(responsibleId)
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Impossible de nommer un utilisateur qui n'est pas dans le projet responsable d'une tâche",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $addToSet: {
          responsibles: responsibleId,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de nommer un responsable dans une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Un nouveau responsable vient d'être ajouté",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function removeResponsible(req, res, next) {
  try {
    const { responsibleId } = req.body;

    if (!responsibleId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: {
          responsibles: responsibleId,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de nommer un responsable dans une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Responsable retiré",
      data: updatedTask,
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

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        // Each startTimer request we push a new session which contains the uid, and the starting time
        $push: {
          "timeTracking.sessions": {
            userId: authUser._id,
            startTime: new Date(),
          },
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message: "Impossible de suivre le temps d'une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Le tracking du temps de la tâche commence",
      data: updatedTask,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function endTimer(req, res, next) {
  try {
    const authUser = res.locals.user;
    const task = await TaskModel.findById({ _id: req.params.id });

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Impossible de suivre le temps d'une tâche qui n'existe pas",
      });
    }

    // Get the active session by getting the one with no end time
    const activeSession = task.timeTracking.sessions.find(
      (session) =>
        session.userId.toString() === authUser?._id.toString() &&
        !session.endTime
    );

    // If no session we return a 404
    if (!activeSession) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de mettre à jour le temps d'un utilisateur qui n'a pas démarrer le timer",
      });
    }

    activeSession.endTime = new Date(); // Setting the end time with the current date
    activeSession.duration =
      new Date(activeSession.endTime) - new Date(activeSession.startTime);

    task.timeTracking.totalTime += activeSession.duration; // Incr the totalTime with the active session duration

    await task.save();

    return res.status(200).send({
      success: true,
      message: "Le tracking du temps de la tâche est terminée",
      data: task,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
