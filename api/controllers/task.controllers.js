import {
  destroyFile,
  uploadFile,
  uploadFileBuffer,
} from "../helpers/cloudinary.js";
import { sendEmail } from "../helpers/nodemailer.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";
import UserModel from "../models/User.model.js";
import { emailDescription } from "../templates/emails.js";
import { allowedStatus, getMatches } from "../utils/utils.js";
import { emailTaskAssigned } from "../templates/emails.js";
import MessageModel from "../models/Message.model.js";
import StatusModel from "../models/Status.model.js";
import PriorityModel from "../models/Priority.model.js";

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

    const status = await StatusModel.findOne({
      projectId: projectId,
      status: "waiting",
    });

    const priority = await PriorityModel.findOne({
      projectId: projectId,
      priority: "medium",
    });

    const newTask = new TaskModel({
      author: authUser?._id,
      projectId: projectId,
      boardId: boardId,
      text: text,
      order: tasks ? tasks.length - 0 : 0,
      status: status?._id,
      priority: priority?._id,
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
    const {
      projectId,
      boardId,
      userId,
      responsiblesId,
      search,
      status,
      priorities,
      archived,
    } = req.query;

    const filters = {};

    if (!projectId && !userId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    if (projectId) filters.projectId = projectId;
    if (boardId) filters.boardId = boardId;
    if (archived) filters.archived = archived;
    if (userId) filters.responsibles = userId;
    if (responsiblesId) {
      filters.responsibles = { $in: responsiblesId?.split(",") };
    }
    if (search) filters.text = { $regex: search, $options: "i" };
    if (status) filters.status = { $in: status?.split(",") };
    if (priorities) filters.priority = { $in: priorities?.split(",") };

    const tasks = await TaskModel.find(filters)
      .sort({ order: "asc" })
      .populate({
        path: "projectId",
        select: "name logo members",
        populate: {
          path: "members.user",
          select: "firstName lastName picture email",
        },
      })
      .populate({
        path: "boardId",
        select: "title color",
      })
      .populate({
        path: "status",
        select: "status name color projectId",
      })
      .populate({
        path: "priority",
        select: "name color _id",
      })
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
        path: "timeTrackings",
        populate: {
          path: "userId",
          select: "-password -role",
        },
      })
      .populate({
        path: "messages",
        select: "readBy",
      })
      .populate({
        path: "description.reactions.userId",
        select: "lastName firstName picture",
      })
      .exec();

    if (tasks.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucune tâche trouvé dans ce projet",
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
    const { statusId } = req.body;

    if (!statusId) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      req.params.id,
      {
        status: statusId,
      },
      {
        new: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible to update the status of a task that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Task status successfully updated",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function updateTaskPriority(req, res, next) {
  try {
    const { priorityId } = req.body;

    if (!priorityId) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          priority: priorityId,
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
          "Impossible to update the priority of a task that does not exist",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Priority updated successfully",
      data: updatedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}

export async function updateTaskDeadline(req, res, next) {
  try {
    const { deadline } = req.body;

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

export async function updateTaskEstimation(req, res, next) {
  try {
    const { estimation } = req.body;

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          estimation: estimation,
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
          "Impossible de modifier l'estimation d'une tâche qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Estimation modifié avec succès",
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
    const { description, taggedUsers, existingFiles } = req.body;

    const task = await TaskModel.findById({ _id: req.params.id });
    const tagged = JSON.parse(taggedUsers);

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier une tâche qui n'existe pas",
      });
    }

    if (task?.description?.text) {
      if (
        authUser?._id.toString() !== task?.description?.author?._id.toString()
      ) {
        return res.status(403).send({
          success: false,
          message:
            "Impossible de modifier une description qui n'est pas le votre",
        });
      }
    }

    const oldFiles = task?.description?.files || [];
    const attachments = req.files || [];
    let newFiles = [];

    let existingFilesArray = [];
    if (existingFiles) {
      if (Array.isArray(existingFiles)) {
        existingFilesArray = existingFiles.map((fileStr) =>
          JSON.parse(fileStr)
        );
      } else if (typeof existingFiles === "string") {
        try {
          const parsed = JSON.parse(existingFiles);
          existingFilesArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.error("Erreur de parsing des fichiers existants:", e);
        }
      }
    }

    if (existingFilesArray.length > 0) {
      existingFilesArray.forEach((file) => {
        newFiles.push({
          name: file.name,
          url: file.url,
          ...(file.id && { id: file.id }),
        });
      });
    }

    if (attachments.length > 0) {
      for (const attachment of attachments) {
        const bufferResponse = await uploadFileBuffer(
          "task/description",
          attachment.buffer,
          attachment.originalname
        );
        const object = {
          name: attachment.originalname,
          url: bufferResponse?.secure_url,
        };
        newFiles.push(object);
      }
    }

    if (newFiles.length > 0) {
      for (const oldFile of oldFiles) {
        const stillExists = newFiles.find((file) => file.url === oldFile.url);
        if (!stillExists) {
          await destroyFile("description", oldFile.url);
        }
      }
    } else if (existingFiles === undefined && attachments.length === 0) {
      for (const oldFile of oldFiles) {
        await destroyFile("description", oldFile.url);
      }
      newFiles = [];
    }

    let updatedDescription = description;

    const uniqueTaggedUsers = Array.from(new Set(tagged));

    const imgRegex = /<img.*?src=["'](.*?)["']/g;

    const matches = getMatches(description, imgRegex);

    if (matches.length > 0) {
      for (const match of matches) {
        const img = match[1]; // Le src est dans le premier groupe capturé

        const res = await uploadFile("task/description", img);

        if (res?.secure_url) {
          updatedDescription = updatedDescription.replace(img, res.secure_url);
        }
      }
    } else {
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

    const updatedTask = await TaskModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          "description.author": authUser?._id,
          "description.text": updatedDescription,
          "description.createdAt": task?.description?.createdAt ?? Date.now(),
          "description.updatedAt": Date.now(),
          "description.files": newFiles,
          taggedUsers: tagged,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const link = `${process.env.CLIENT_URL}/projects/${updatedTask?.projectId}/task/${updatedTask?._id}`;

    for (const taggedUser of uniqueTaggedUsers) {
      const user = await UserModel.findById({ _id: taggedUser });

      const template = emailDescription(authUser, updatedTask, link);

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

export async function updateTaskDescriptionReactions(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).send({
        success: false,
        message: "Emoji manquant",
      });
    }

    const task = await TaskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Tâche non trouvée",
      });
    }

    if (task?.description?.author.equals(authUser._id)) {
      return res.status(403).send({
        success: false,
        message: "Vous ne pouvez pas réagir à votre propre description",
      });
    }

    if (!task.description || !task.description.text) {
      return res.status(400).send({
        success: false,
        message: "Cette tâche n'a pas de description",
      });
    }

    if (!task.description.reactions) {
      task.description.reactions = [];
    }

    const existingReactionIndex = task.description.reactions.findIndex(
      (reaction) => reaction.userId.equals(authUser._id)
    );

    let responseMessage = "";

    if (existingReactionIndex !== -1) {
      const existingReaction =
        task.description.reactions[existingReactionIndex];
      if (existingReaction.emoji === emoji) {
        task.description.reactions.splice(existingReactionIndex, 1);
        responseMessage = "Réaction supprimée avec succès";
      } else {
        task.description.reactions[existingReactionIndex].emoji = emoji;
        responseMessage = "Réaction mise à jour avec succès";
      }
    } else {
      task.description.reactions.push({
        userId: authUser._id,
        emoji,
      });
      responseMessage = "Réaction ajoutée avec succès";
    }

    task.markModified("description");

    const updatedTask = await task.save();

    return res.status(200).send({
      success: true,
      message: responseMessage,
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

    const isProjectMember = project?.members.find(
      (member) => member?.user?.toString() === responsibleId
    );

    if (!isProjectMember) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de nommer responsable d'une tâche un utilisateur qui n'est pas dans le projet",
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
      const projectLink = `${process.env.CLIENT_URL}/projects/${updatedTask.projectId._id}`;

      const template = emailTaskAssigned(updatedTask, authUser, projectLink);
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

    const taskData = await TaskModel.findById({ _id: req.params.id })
      .populate({
        path: "timeTracking.sessions.userId", // Accès à userId dans sessions
        select: "-password -role", // Exclure les champs sensibles
      })
      .exec();

    return res.status(200).send({
      success: true,
      message: "Le tracking du temps de la tâche est terminée",
      data: taskData,
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
    )
      .populate({
        path: "timeTracking.sessions.userId", // Accès à userId dans sessions
        select: "-password -role", // Exclure les champs sensibles
      })
      .exec();

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

      const attachments = task?.description?.files;

      if (attachments) {
        for (const attachment of attachments) {
          await destroyFile("description", attachment?.url);
        }
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
