import ProjectModel from "../models/Project.model.js";

export async function isAuthor(req, res, next) {
  try {
    const authUser = res.locals.user;
    // For project routes it will takes params.id for other routes such as board routes it will take query.projectId
    const projectId = req.query.projectId || req.params.id;

    if (!projectId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const project = await ProjectModel.findById({
      _id: projectId,
    });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Aucun projet n'a été trouvé dans la base de données",
      });
    }

    if (project.author !== authUser._id) {
      return res.status(403).send({
        success: false,
        message:
          "Accès refusé : L'utilisateur n'est pas autorisé à effectuer cette action",
      });
    }

    next();
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function isAuthorOrGuests(req, res, next) {
  try {
    const authUser = res.locals.user;
    // For project routes it will takes params.id for other routes such as board routes it will take query.projectId
    const projectId = req.query.projectId || req.params.id;

    const project = await ProjectModel.findById({
      _id: projectId,
    });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Aucun projet n'a été trouvé dans la base de données",
      });
    }

    if (
      project.author !== authUser._id &&
      !project.guests.includes(authUser._id)
    ) {
      return res.status(403).send({
        success: false,
        message:
          "Accès refusé : L'utilisateur n'est pas autorisé à effectuer cette action",
      });
    }

    next();
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
