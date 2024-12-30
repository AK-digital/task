import ResponseModel from "../models/Response.model.js";
import sharp from "sharp";

export async function saveResponse(req, res, next) {
  try {
    const projectId = req.query.projectId;
    const authUser = res.locals.user;
    const { taskId, message, taggedUsers } = req.body;
    const medias = req.files["medias"];

    if (!taskId || !message) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const files = [];
    if (medias) {
      for (const media of medias) {
        const uploadPath = path.resolve(process.cwd(), "uploads");
        const outputFilePath = path.join(uploadPath, `${media.filename}.webp`);
        const convertedFile = await sharp(media.path)
          .webp({ quality: 80 }) // Qualité de compression
          .toFile("../uploads/output.webp");
        console.log(convertedFile);
        files.push(media.filename);
      }
    }

    const newResponse = new ResponseModel({
      projectId: projectId,
      taskId: taskId,
      author: authUser?._id,
      message: message,
      taggedUsers: taggedUsers,
      files: files,
    });

    const savedResponse = await newResponse.save();

    return res.status(201).send({
      success: true,
      message: "Réponse créée avec succès",
      data: savedResponse,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function getResponses(req, res, next) {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(500).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const responses = await ResponseModel.find({ taskId: taskId });

    if (responses.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucune réponses trouvé pour cette tâche",
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
    if (taggedUsers && taggedUsers.length > 0)
      updateFields.taggedUsers = taggedUsers;
    if (files.length > 0) updateFields.files = files; // If there is files then are updating the files field

    const updatedResponse = await ResponseModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: updateFields,
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

export async function deleteResponse(req, res, next) {
  try {
    const deletedResponse = await ResponseModel.findByIdAndDelete({
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
