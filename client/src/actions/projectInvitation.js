"use server";

import { useAuthFetch } from "@/utils/api";

export async function updateProjectInvitationRole(t, prevState, formData) {
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
      throw new Error(response?.message || t("common.error"));
    }

    return {
      status: "success",
      message: response?.message || t("project_invitation.role.update.success"),
    };
  } catch (err) {
    console.log(err?.message || t("project_invitation.role.update.error"));

    return {
      status: "failure",
      message: err?.message || t("project_invitation.role.update.error"),
    };
  }
}

export async function deleteProjectInvitation(t, prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const projectInvitationId = formData.get("project-invitation-id");

    const res = await useAuthFetch(
      `project-invitation/${projectInvitationId}?projectId=${projectId}`,
      "DELETE",
      "application/json"
    );
    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || t("common.error"));
    }

    return {
      status: "success",
      message: response?.message || t("project_invitation.delete.success"),
    };
  } catch (err) {
    console.log(err?.message || t("project_invitation.delete.error"));

    return {
      status: "failure",
      message: err?.message || t("project_invitation.delete.error"),
    };
  }
}
