import ProjectModel from "../models/Project.model.js";

export async function checkProjectRole(req, res, next) {
  try {
    const authUser = res.locals.user;
    const projectId = req.query.projectId || req.params.id;

    const project = await ProjectModel.findOne({
      _id: projectId,
      $or: [{ author: authUser?._id }, { guests: authUser?._id }],
    });

    if (!project) {
      return res.status(403).send({
        success: false,
        message: "L'utilisateur connecté n'a pas le droit",
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
