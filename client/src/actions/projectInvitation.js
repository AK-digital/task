"use server";

import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";

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
      throw new Error(response?.message);
    }

    revalidateTag("project");

    return {
      status: "success",
      message: "project_invitation.role.update.success",
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || "project_invitation.role.update.error",
    };
  }
}

export async function deleteProjectInvitation(prevState, formData) {
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
      throw new Error(response?.message);
    }

    revalidateTag("project");

    return {
      status: "success",
      message: "project_invitation.delete.success",
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || "project_invitation.delete.error",
    };
  }
}
