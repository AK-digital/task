import ResponseModel from "../models/Response.model";

export async function saveResponse(req, res, next) {
  try {
  } catch (error) {
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
        message: "Paramètres manquans",
      });
    }

    const responses = await ResponseModel.find({ taskId: taskId });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateResponse(req, res, next) {
  try {
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function deleteResponse(req, res, next) {
  try {
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
