import ProjectInvitationModel from "../models/ProjectInvitation.model.js";

export async function getProjectInvitations(req, res, next) {
  try {
    const projectsInvitations = await ProjectInvitationModel.find({
      projectId: req.params.projectId,
    });

    if (!projectsInvitations) {
      return res.status(404).send({
        success: false,
        message: "Aucune invitation de projet trouvée",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Invitations de projet récupérées avec succès",
      data: projectsInvitations,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la recherche des invitations de projet",
    });
  }
}

export async function deleteProjectInvitation(req, res, next) {
  try {
    const projectInvitation = await ProjectInvitationModel.findByIdAndDelete(
      req.params.id
    );

    if (!projectInvitation) {
      return res.status(404).send({
        success: false,
        message: "Invitation de projet non trouvée",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Invitation de projet supprimée avec succès",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la suppression de l'invitation de projet",
    });
  }
}
