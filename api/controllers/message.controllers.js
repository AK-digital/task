import { destroyFile, uploadFile } from "../helpers/cloudinary.js";
import { sendEmail } from "../helpers/nodemailer.js";
import MessageModel from "../models/Message.model.js";
import UserModel from "../models/User.model.js";
import { emailMessage } from "../templates/emails.js";
import { getMatches } from "../utils/utils.js";

export async function saveMessage(req, res, next) {
  try {
    const projectId = req.query.projectId;
    const authUser = res.locals.user;
    const { taskId, message, taggedUsers } = req.body;

    // Ensure that there is no duplicate value
    const uniqueTaggedUsers = Array.from(new Set(taggedUsers));

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
      taggedUsers: uniqueTaggedUsers,
    });

    const savedMessage = await newMessage.save();

    const link =
      "/projects/" + savedMessage?.projectId + "/task/" + savedMessage?.taskId;

    // Email Logic, basically sending an email for each tagged user
    for (const taggedUser of uniqueTaggedUsers) {
      const user = await UserModel.findById({ _id: taggedUser });

      const template = emailMessage(user, savedMessage, link);

      if (user) {
        await sendEmail(
          "task@akdigital.fr",
          user?.email,
          template.subjet,
          template.text
        );
      }
    }

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
    const authUser = res.locals.user;
    const { message, taggedUsers } = req.body;

    const messageToUpdate = await MessageModel.findById({ _id: req.params.id });

    if (authUser?._id.toString() !== messageToUpdate?.author.toString()) {
      return res.status(403).send({
        success: false,
        message: "Impossible de modifier un message qui n'est pas le votre",
      });
    }

    const uniqueTaggedUsers = Array.from(new Set(taggedUsers));

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
    } else {
      const message = await MessageModel.findById({ _id: req.params.id });

      const messageContent = message?.message;

      if (messageContent) {
        const messageMatches = getMatches(messageContent, imgRegex);

        if (messageMatches.length > 0) {
          for (const messageMatch of messageMatches) {
            const img = messageMatch[1];

            await destroyFile("message", img);
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

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          message: messageWithImg ?? message,
          taggedUsers: taggedUsers,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!updatedMessage) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier une réponse qui n'existe pas",
      });
    }

    // Email Logic, basically sending an email for each tagged user
    for (const taggedUser of uniqueTaggedUsers) {
      const user = await UserModel.findById({ _id: taggedUser });

      const template = emailMessage(user, updatedMessage);

      if (user) {
        await sendEmail(
          "task@akdigital.fr",
          user?.email,
          template.subjet,
          template.text
        );
      }
    }

    return res.status(200).send({
      success: true,
      message: "Réponse modifié avec succès",
      data: updatedMessage,
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
    const authUser = res.locals.user;

    const imgRegex = /<img.*?src=["'](.*?)["']/g;

    const message = await MessageModel.findById({ _id: req.params.id });

    if (authUser?._id.toString() !== message?.author.toString()) {
      return res.status(403).send({
        success: false,
        message: "Impossible de supprimer un message qui n'est pas le votre",
      });
    }

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
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
