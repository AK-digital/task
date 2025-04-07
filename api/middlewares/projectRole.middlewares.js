import ProjectModel from "../models/Project.model.js";

export async function isAuthor(req, res, next) {
  try {
    const authUser = res.locals.user;

    console.log(authUser);
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

    const author = project?.author.toString();
    const authUserId = authUser._id.toString();

    if (author !== authUserId) {
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

    const author = project?.author.toString();
    const authUserId = authUser._id.toString();

    if (author !== authUserId && !project.guests.includes(authUserId)) {
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

// Checks if the user has the required role to perform the action
export function checkRole(requiredRoles) {
  return async (req, res, next) => {
    try {
      const authUser = res.locals.user;
      // For project routes it will takes params.id for other routes such as board routes it will take query.projectId
      const projectId = req.query.projectId || req.params.id;

      // Project id is required
      if (!projectId) {
        return res.status(400).send({
          success: false,
          message: "Paramètres manquants",
        });
      }

      const project = await ProjectModel.findById({ _id: projectId });

      // Project need to be found
      if (!project) {
        return res.status(404).send({
          success: false,
          message: "Aucun projet n'a été trouvé dans la base de données",
        });
      }

      // Check if the authenticate user is a member of the project
      const member = project?.members?.find(
        (member) => member?.user?.toString() === authUser?._id?.toString()
      );

      // If not a member, return 403
      if (!member) {
        return res.status(403).send({
          success: false,
          message:
            "Accès refusé : Cet utilisateur n'est pas membre de ce projet",
        });
      }

      // Check if the member has the required role
      if (!requiredRoles.includes(member.role)) {
        return res.status(403).send({
          success: false,
          message:
            "Accès refusé : Cet utilisateur n'est pas autorisée à effectuer cette action",
        });
      }

      // If the user is a member and has the required role, continue to the next middleware
      next();
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message || "Une erreur inattendue est survenue",
      });
    }
  };
}
