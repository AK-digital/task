"use server";

import { useAuthFetch } from "@/utils/api";

export async function updateProjectInvitationRole(prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const projectInvitationId = formData.get("project-invitation-id");
    const role = formData.get("role");
    const email = formData.get("email");

    const res = await useAuthFetch(
      `project-invitation/${projectInvitationId}?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { role, email }
    );
    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    return {
      status: "success",
      message:
        response?.message || "Rôle de l'utilisateur mis à jour avec succès",
    };
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur s'est produite lors de la mise à jour du rôle de l'utilisateur"
    );

    return {
      status: "failure",
      message:
        err?.message ||
        "Une erreur s'est produite lors de la mise à jour du rôle de l'utilisateur",
    };
  }
}

export async function deleteProjectInvitation(prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const projectInvitationId = formData.get("project-invitation-id");

    console.log(projectId, projectInvitationId)
    console.log("played")

    const res = await useAuthFetch(
      `project-invitation/${projectInvitationId}?projectId=${projectId}`,
      "DELETE",
      "application/json"
    );
    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    return {
      status: "success",
      message:
        response?.message || "Invitation de projet supprimée avec succès",
    };
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur s'est produite lors de la suppression de l'invitation de projet"
    );

    return {
      status: "failure",
      message:
        err?.message ||
        "Une erreur s'est produite lors de la suppression de l'invitation de projet",
    };
  }
}
