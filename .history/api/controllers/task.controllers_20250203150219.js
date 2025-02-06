import { destroyFile, uploadFile } from "../helpers/cloudinary.js";
import { sendEmail } from "../helpers/nodemailer.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";
import userModel from "../models/user.model.js";
import { emailDescription } from "../templates/emails.js";
import { regex } from "../utils/regex.js";
import { getMatches } from "../utils/utils.js";

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
      boardId: boardId,
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
    const boardId = req.query.boardId;

    const tasks = await TaskModel.find({ boardId: boardId })
      .sort({ order: "asc" })
      .populate({
        path: "responsibles",
        select: "-password -role", // Exclure le champ `password` des responsibles
      })
      .populate({
        path: "timeTracking.sessions.userId", // Accès à userId dans sessions
        select: "-password -role", // Exclure les champs sensibles
      })
      .exec();

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
    const { description, taggedUsers } = req.body;
    let updatedDescription = description;

    const uniqueTaggedUsers = Array.from(new Set(taggedUsers));

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
      const task = await TaskModel.findById({ _id: req.params.id });

      const taskDescription = task?.description;

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

    const updateFields = {};
    updateFields.description = updatedDescription;
    updateFields.taggedUsers = uniqueTaggedUsers;

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

    for (const taggedUser of uniqueTaggedUsers) {
      const user = await userModel.findById({ _id: taggedUser });

      const template = emailDescription(user, updatedTask);

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

// Only authors and guets will be able to delete the tasks
export async function deleteTask(req, res, next) {
  try {
    const imgRegex = /<img.*?src=["'](.*?)["']/g;

    const task = await TaskModel.findById({ _id: req.params.id });

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer une tâche qui n'existe pas",
      });
    }

    const description = task?.description;

    if (description) {
      const matches = getMatches(description, imgRegex);

      if (matches.length > 0) {
        for (const match of matches) {
          const img = match[1];

          await destroyFile("description", img);
        }
      }
    }

    const deletedTask = await TaskModel.findByIdAndDelete({
      _id: req.params.id,
    });

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

    const responsible = await userModel.findById({ _id: responsibleId });

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
      .populate({
        path: "responsibles",
      })
      .exec();

    if (!updatedTask) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible de nommer un responsable dans une tâche qui n'existe pas",
      });
    }

    const subjet = `Vous avez été nommé responsable d'une tâche dans le projet ${updatedTask?.projectId?.name}`;
    const text = `
        <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
          <h1 style="color: #5056C8;">Une tâche vous a été assigné sur Täsk</h1>
          <p>Bonjour,</p>
          <p>Vous avez été nommé responsable de la tâche : <strong>${updatedTask?.text}</strong>. 
        </div>
        `;

    await sendEmail("task@akdigital.fr", responsible?.email, subjet, text);

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

export async function updateTaskOrder(req, res, next) {
  try {
    const { tasks } = req.body;

    if (tasks?.length <= 0) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const updatePromises = tasks.map((task, index) => {
      return TaskModel.findByIdAndUpdate(
        task._id,
        { $set: { order: index } },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return res.status(500).send({
      success: true,
      message: "L'ordre des tâches a été mis à jour",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
