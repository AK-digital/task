import ProjectModel from "../models/Project.model";

export function saveProject(req, res, next) {
  try {
    const { author, name } = req.body;

    if (!author || !name) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newProject = new ProjectModel({
      author: author,
      name: name,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
