import { destroyFile, uploadFile } from "../helpers/cloudinary.js";
import { sendEmail } from "../helpers/nodemailer.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";
import UserModel from "../models/User.model.js";
import { emailDescription } from "../templates/emails.js";
import { regex } from "../utils/regex.js";
import { getMatches } from "../utils/utils.js";
import { emailTaskAssigned } from "../templates/emails.js";
import MessageModel from "../models/Message.model.js";

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

    const tasks = await TaskModel.find({
      projectId: projectId,
    });

    const newTask = new TaskModel({
      author: authUser?._id,
      projectId: projectId,
      boardId: boardId,
      text: text,
      order: tasks ? tasks.length - 0 : 0,
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
    console.log("played");
    const { boardId, archived } = req.query;

    const tasks = await TaskModel.find({ boardId: boardId, archived: archived })
      .sort({ order: "asc" })
      .populate({
        path: "responsibles",
        select: "-password -role", // Exclure le champ `password` des responsibles
      })
      .populate({
        path: "author",
        select: "-password -role", // Exclure le champ `password` des responsibles
      })
      .populate({
        path: "description.author", // Accès à l'auteur de la description
        select: "-password -role", // Exclure les champs sensibles
      })
      .populate({
        path: "timeTracking.sessions.userId", // Accès à userId dans sessions
        select: "-password -role", // Exclure les champs sensibles
      })
      .exec();

    console.log(tasks);

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

// Only authors and guets will be able to get the tasks
export async function getTask(req, res, next) {
  try {
    const projectId = req.query.projectId;

    const task = await TaskModel.findById({
      _id: req.params.id,
      projectId: projectId,
    });

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Impossible de trouver la tâche",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tâches trouvée",
      data: task,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only authors and guets will be able to update the tasks
export async function updateTaskText(req, res, next) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          text: text,
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

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          status: status,
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
          "Impossible de modifier le status d'une tâche qui n'existe pas",
      });
    }

    console.log(updatedTask);

    return res.status(200).send({
      success: true,
      message: "Status modifié avec succès",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTaskPriority(req, res, next) {
  try {
    const { priority } = req.body;

    const allowedPriority = ["Basse", "Moyenne", "Haute", "Urgent"];

    if (!priority) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    if (priority) {
      if (!allowedPriority.includes(priority)) {
        return res.status(400).send({
          success: false,
          message: "Paramètres invalide",
        });
      }
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          priority: priority,
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
          "Impossible de modifier la priorité d'une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Priorité modifié avec succès",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTaskDeadline(req, res, next) {
  try {
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          deadline: deadline,
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
          "Impossible de modifier la deadline d'une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Deadline modifié avec succès",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTaskDescription(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { description, taggedUsers } = req.body;

    console.log(typeof description);

    let updatedDescription = description;

    const uniqueTaggedUsers = Array.from(new Set(taggedUsers));

    const imgRegex = /<img.*?src=["'](.*?)["']/g;

    const matches = getMatches(description, imgRegex);

    console.log(matches);

    if (matches.length > 0) {
      for (const match of matches) {
        const img = match[1]; // Le src est dans le premier groupe capturé

        const res = await uploadFile("task/description", img);

        if (res?.secure_url) {
          updatedDescription = updatedDescription.replace(img, res.secure_url);
        }
      }
    } else {
      const task = await TaskModel.findById({ _id: req.params.id });

      const taskDescription = task?.description?.text;

      if (taskDescription) {
        const descriptionMatches = getMatches(taskDescription, imgRegex);

        if (descriptionMatches.length > 0) {
          for (const descriptionMatch of descriptionMatches) {
            const img = descriptionMatch[1];

            await destroyFile("description", img);
          }
        }
      }
    }

    const task = await TaskModel.findById({ _id: req.params.id });

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          "description.author": authUser?._id,
          "description.text": updatedDescription,
          "description.createdAt": task?.description?.createdAt ?? Date.now(),
          "description.updatedAt": Date.now(),
          taggedUsers: uniqueTaggedUsers,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const link =
      "/projects/" + updatedTask?.projectId + "/task/" + updatedTask?._id;

    for (const taggedUser of uniqueTaggedUsers) {
      const user = await UserModel.findById({ _id: taggedUser });

      const template = emailDescription(user, updatedTask, link);

      if (user) {
        await sendEmail(
          "task@akdigital.fr",
          user?.email,
          template?.subjet,
          template?.text
        );
      }
    }

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de modifier la description d'une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Description modifié avec succès",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function addResponsible(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { responsibleId } = req.body;

    if (!responsibleId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const responsible = await UserModel.findById({ _id: responsibleId });

    if (!responsible) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de nommer responsable d'une tâche un utilisateur qui n'existe pas",
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
    )
      .populate({
        path: "projectId",
        select: "name",
      })
      .exec();

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de nommer un responsable dans une tâche qui n'existe pas",
      });
    }

    if (authUser?._id.toString() !== responsibleId) {
      const projectLink = `${process.env.CLIENT_URL}/project/${updatedTask.projectId._id}`;

      const template = emailTaskAssigned(updatedTask, projectLink);
      await sendEmail(
        "task@akdigital.fr",
        responsible?.email,
        template.subjet,
        template.text
      );
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

export async function addTaskSession(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          "timeTracking.sessions": {
            userId: authUser?._id,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration: new Date(endTime) - new Date(startTime),
          },
        },
        $inc: {
          "timeTracking.totalTime": new Date(endTime) - new Date(startTime),
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
        message: "Impossible de définir le temps d'une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Le tracking du temps de la tâche a bien été défini",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function removeTaskSession(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const task = await TaskModel.findById({ _id: req.params.id });

    if (!task) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de supprimer une session d'une tâche qui n'existe pas",
      });
    }

    const session = task.timeTracking.sessions.id(sessionId);

    if (session?.userId.toString() !== authUser?._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cette session",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: {
          "timeTracking.sessions": {
            _id: sessionId,
          },
        },
        $inc: {
          "timeTracking.totalTime": -session.duration,
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
          "Impossible de supprimer la session d'une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Session supprimée",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTaskOrder(req, res, next) {
  try {
    const { tasks } = req.body;

    if (!tasks || tasks.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Aucune tâche à mettre à jour",
      });
    }

    const bulkOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: { $set: { order: task.order, boardId: task.boardId } },
      },
    }));

    await TaskModel.bulkWrite(bulkOps);

    return res.status(200).send({
      success: true,
      message: "L'ordre et les colonnes des tâches ont été mis à jour",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateTaskBoard(req, res, next) {
  try {
    const { boardId } = req.body;

    if (!boardId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          boardId: boardId,
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
        message: "Impossible de déplacer une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tâche déplacée avec succès",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function addTaskToArchive(req, res, next) {
  try {
    const { tasks } = req.body;

    if (!tasks || tasks?.length <= 0) {
      return res.status(400).send({
        success: false,
        message: "Aucune tâche à archiver",
      });
    }

    const bulkOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task },
        update: { $set: { archived: true } },
      },
    }));

    await TaskModel.bulkWrite(bulkOps);

    return res.status(200).send({
      success: true,
      message: "Les tâches ont été archivées avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function removeTaskFromArchive(req, res, next) {
  try {
    const { tasks } = req.body;

    if (!tasks || tasks?.length <= 0) {
      return res.status(400).send({
        success: false,
        message: "Aucune tâche à désarchiver",
      });
    }

    const bulkOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task },
        update: { $set: { archived: false } },
      },
    }));

    await TaskModel.bulkWrite(bulkOps);

    return res.status(200).send({
      success: true,
      message: "Les tâches ont été désarchivées avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only authors and guets will be able to delete the tasks
export async function deleteTask(req, res, next) {
  try {
    const tasks = req.body.tasks;

    if (tasks.length <= 0) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const imgRegex = /<img.*?src=["'](.*?)["']/g;
    let deletedTasks = [];

    // Parcours des IDs de tâches reçus dans la requête
    for (const taskId of tasks) {
      // Recherche de la tâche par ID
      const task = await TaskModel.findById(taskId);
      const message = await MessageModel.findOne({ taskId: taskId });

      if (!task) {
        return res.status(404).send({
          success: false,
          message: `Impossible de supprimer la tâche avec l'ID ${taskId} car elle n'existe pas`,
        });
      }

      // Suppression des images dans la description de la tâche
      const description = task?.description?.text;
      if (description) {
        const matches = getMatches(description, imgRegex);
        if (matches.length > 0) {
          for (const match of matches) {
            const img = match[1];
            await destroyFile("description", img);
          }
        }
      }

      const messageContent = message?.message;

      if (messageContent) {
        const matches = getMatches(messageContent, imgRegex);
        if (matches.length > 0) {
          for (const match of matches) {
            const img = match[1];
            await destroyFile("message", img);
          }
        }
      }

      // Suppression de la tâche
      const deletedTask = await TaskModel.findByIdAndDelete({ _id: taskId });
      deletedTasks.push(deletedTask);
    }

    return res.status(200).send({
      success: true,
      message: `${deletedTasks.length} tâche(s) supprimée(s) avec succès`,
      data: deletedTasks,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Une erreur inattendue est survenue",
    });
  }
}
