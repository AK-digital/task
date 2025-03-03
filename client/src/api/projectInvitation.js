"use server";
import { useAuthFetch } from "@/utils/api";

export async function getProjectInvitations(projectId) {
  try {
    const res = await useAuthFetch(
      `project-invitation/${projectId}?projectId=${projectId}`,
      "GET",
      "application/json",
      null,
      "project-invitations"
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    return response?.data;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur s'est produite lors de la recherche des invitations de projet"
    );
  }
}
