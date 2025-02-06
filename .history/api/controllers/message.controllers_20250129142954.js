import MessageModel from "../models/Message.model.js";

export async function saveMessage(req, res, next) {
  try {
    const projectId = req.query.projectId;
    const authUser = res.locals.user;
    const { taskId, message, taggedUsers } = req.body;

    let messageWithImg = message;

    if (!taskId || !message) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newMessage = new MessageModel({
      projectId: projectId,
      taskId: taskId,
      author: authUser?._id,
      message: message,
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
      message: "Réponses trouvés",
      data: responses,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateResponse(req, res, next) {
  try {
    const { message, taggedUsers } = req.body;
    const medias = req.files["medias"];

    // If both are missing then we return a bad request
    if (!message && !taggedUsers) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const files = [];
    if (medias) {
      for (const media of medias) {
        files.push(media.filename);
      }
    }

    const updateFields = {};
    if (message) updateFields.message = message;
    if (taggedUsers.length > 0) updateFields.taggedUsers = taggedUsers;
    if (files.length > 0) updateFields.files = files; // If there is files then are updating the files field

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
    const deletedResponse = await MessageModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedResponse) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer une réponse qui n'existe pas",
      });
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
