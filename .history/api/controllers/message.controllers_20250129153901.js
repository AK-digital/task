import { destroyFile, uploadFile } from "../helpers/cloudinary.js";
import MessageModel from "../models/Message.model.js";
import { getMatches } from "../utils/utils.js";

export async function saveMessage(req, res, next) {
  try {
    const projectId = req.query.projectId;
    const authUser = res.locals.user;
    const { taskId, message, taggedUsers } = req.body;

    if (!taskId || !message) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    let messageWithImg = message;

    const imgRegex = /<img.*?src=["'](.*?)["']/g;

    const matches = getMatches(message, imgRegex);

    if (matches.length > 0) {
      for (const match of matches) {
        const img = match[1]; // Le src est dans le premier groupe capturé

        const res = await uploadFile("task/message", img);

        if (res?.secure_url) {
          messageWithImg = messageWithImg.replace(img, res.secure_url);
        }
      }
    }

    const newMessage = new MessageModel({
      projectId: projectId,
      taskId: taskId,
      author: authUser?._id,
      message: messageWithImg ?? message,
      taggedUsers: taggedUsers,
    });

    const savedMessage = await newMessage.save();

    return res.status(201).send({
      success: true,
      message: "Message créée avec succès",
      data: savedMessage,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function getMessages(req, res, next) {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(500).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const responses = await MessageModel.find({ taskId: taskId }).populate({
      path: "author",
      select: "lastName firstName picture",
    });

    if (responses.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun messages trouvé pour cette tâche",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Messages trouvés",
      data: responses,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateMessage(req, res, next) {
  try {
    const { message, taggedUsers } = req.body;
    let updatedDescription = description;

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

    // If both are missing then we return a bad request
    if (!message && !taggedUsers) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const updatedResponse = await MessageModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          message: message,
          taggedUsers: taggedUsers,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedResponse) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier une réponse qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Réponse modifié avec succès",
      data: updatedResponse,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function deleteMessage(req, res, next) {
  try {
    const imgRegex = /<img.*?src=["'](.*?)["']/g;

    const message = await MessageModel.findById({ _id: req.params.id });

    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer un message qui n'existe pas",
      });
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

    const deletedMessage = await MessageModel.findByIdAndDelete({
      _id: req.params.id,
    });

    return res.status(200).send({
      success: true,
      message: "Message supprimé avec succès",
      data: deletedMessage,
    });

    return;
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
