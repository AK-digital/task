import {
  destroyFile,
  uploadFile,
  uploadFileBuffer,
} from "../helpers/cloudinary.js";
import { sendEmail } from "../helpers/nodemailer.js";
import MessageModel from "../models/Message.model.js";
import TaskModel from "../models/Task.model.js";
import UserModel from "../models/User.model.js";
import { emailMessage } from "../templates/emails.js";
import { getMatches } from "../utils/utils.js";

export async function saveMessage(req, res, next) {
  try {
    const projectId = req.query.projectId;
    const authUser = res.locals.user;
    const { taskId, message, taggedUsers } = req.body;
    const attachments = req.files || [];

    const tagged = JSON.parse(taggedUsers);

    let files = [];

    if (attachments.length > 0) {
      for (const attachment of attachments) {
        const bufferResponse = await uploadFileBuffer(
          "clynt/message",
          attachment.buffer,
          attachment.originalname
        );
        const isTooHeavy = bufferResponse.bytes;
        if (isTooHeavy > 5 * 1024 * 1024) {
          return res.status(400).send({
            success: false,
            message: "Fichier trop lourd",
          });
        }
        const object = {
          name: attachment?.originalname,
          url: bufferResponse?.secure_url,
          size: isTooHeavy,
        };
        files.push(object);
      }
    }

    // Ensure that there is no duplicate value
    const uniqueTaggedUsers = Array.from(new Set(tagged));

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

        const res = await uploadFile("clynt/message", img);

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
      readBy: [authUser?._id],
      files: files,
    });

    const savedMessage = await newMessage.save();

    const link = `${process.env.CLIENT_URL}/projects/${projectId}/task/${taskId}`;

    // Email Logic, basically sending an email for each tagged user
    for (const taggedUser of uniqueTaggedUsers) {
      const user = await UserModel.findById({ _id: taggedUser });

      const template = emailMessage(authUser, savedMessage, link);

      if (user) {
        await sendEmail(
          "notifications@clynt.io",
          user?.email,
          template?.subjet,
          template?.text
        );
      }
    }

    await TaskModel.findByIdAndUpdate(
      { _id: taskId },
      {
        $addToSet: { messages: savedMessage._id },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

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

    const messages = await MessageModel.find({
      taskId: taskId,
    })
      .populate({
        path: "author",
        select: "lastName firstName picture",
      })
      .populate({
        path: "readBy",
        select: "lastName firstName picture",
      })
      .populate({
        path: "reactions.userId",
        select: "lastName firstName picture",
      })
      .exec();

    if (messages.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun messages trouvé pour cette tâche",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Messages trouvés",
      data: messages,
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
    const { message, taggedUsers, existingFiles } = req.body;
    const messageToUpdate = await MessageModel.findById({ _id: req.params.id });

    const tagged = JSON.parse(taggedUsers);

    if (!messageToUpdate) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier une réponse qui n'existe pas",
      });
    }

    if (authUser?._id.toString() !== messageToUpdate?.author.toString()) {
      return res.status(403).send({
        success: false,
        message: "Impossible de modifier un message qui n'est pas le votre",
      });
    }

    if (
      !message &&
      !taggedUsers &&
      (!req.files || req.files.length === 0) &&
      !existingFiles
    ) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const uniqueTaggedUsers = Array.from(new Set(tagged || []));

    let messageWithImg = message;
    const imgRegex = /<img.*?src=["'](.*?)["']/g;
    const matches = getMatches(message, imgRegex);

    if (matches.length > 0) {
      for (const match of matches) {
        const img = match[1];
        const resImg = await uploadFile("clynt/message", img);
        if (resImg?.secure_url) {
          messageWithImg = messageWithImg.replace(img, resImg.secure_url);
        }
      }
    } else {
      const messageContent = messageToUpdate?.message;
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

    const oldFiles = messageToUpdate.files || [];
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
          "clynt/message",
          attachment.buffer,
          attachment.originalname
        );
        const isTooHeavy = bufferResponse.bytes;
        if (isTooHeavy > 5 * 1024 * 1024) {
          return res.status(400).send({
            success: false,
            message: "Fichier trop lourd",
          });
        }
        const object = {
          name: attachment.originalname,
          url: bufferResponse?.secure_url,
          size: isTooHeavy,
        };
        newFiles.push(object);
      }
    }

    if (newFiles.length > 0) {
      for (const oldFile of oldFiles) {
        const stillExists = newFiles.find((file) => file.url === oldFile.url);
        if (!stillExists) {
          await destroyFile("message", oldFile.url);
        }
      }
    } else if (existingFiles === undefined && attachments.length === 0) {
      for (const oldFile of oldFiles) {
        await destroyFile("message", oldFile.url);
      }
      newFiles = [];
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          message: messageWithImg ?? message,
          taggedUsers: uniqueTaggedUsers,
          files: newFiles,
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

    for (const taggedUser of uniqueTaggedUsers) {
      const user = await UserModel.findById({ _id: taggedUser });
      if (user) {
        const template = emailMessage(user, updatedMessage);
        await sendEmail(
          "notifications@clynt.io",
          user.email,
          template.subjet,
          template.text
        );
      }
    }

    return res.status(200).send({
      success: true,
      message: "Réponse modifiée avec succès",
      data: updatedMessage,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateReadBy(req, res, next) {
  try {
    const authUser = res.locals.user;

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $addToSet: { readBy: authUser?._id },
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

    return res.status(200).send({
      success: true,
      message: "Réponse lu avec succès",
      data: updatedMessage,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateReactions(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).send({
        success: false,
        message: "Emoji manquant",
      });
    }

    const message = await MessageModel.findById({ _id: req.params.id });

    if (message?.author?.equals(authUser?._id)) {
      return res.status(403).send({
        success: false,
        message: "Impossible de réagir à son propre message",
      });
    }

    if (!message) {
      return res.status(404).send({
        success: false,
        message:
          "Impossible d'ajouter une réaction à un message qui n'existe pas",
      });
    }

    let responseMessage = "";

    // Check if the user has already reacted to the message by finding the index of the reaction
    const isUserReacted = message?.reactions?.findIndex((reaction) =>
      reaction?.userId?.equals(authUser?._id)
    );

    // If the user has not reacted yet, we add the reaction to the message
    if (isUserReacted === -1) {
      message?.reactions.push({ userId: authUser?._id, emoji });
      responseMessage = "Réaction ajoutée avec succès";
    } else {
      // If the user has already reacted, we check if the emoji is the same as the one they previously used
      const reaction = message?.reactions[isUserReacted];

      if (reaction?.emoji === emoji) {
        message?.reactions?.splice(isUserReacted, 1);
        responseMessage = "Réaction supprimée avec succès";
      } else {
        message.reactions[isUserReacted].emoji = emoji;
        responseMessage = "Réaction mise à jour avec succès";
      }
    }

    const updatedMessage = await message.save();

    return res.status(200).send({
      success: true,
      message: responseMessage,
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

    const attachments = message.files;

    if (attachments) {
      for (const attachment of attachments) {
        await destroyFile("message", attachment?.url);
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

    const deletedMessage = await MessageModel.findByIdAndDelete({
      _id: req.params.id,
    });

    await TaskModel.findByIdAndUpdate(
      { _id: message?.taskId },
      {
        $pull: { messages: deletedMessage?._id },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

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
