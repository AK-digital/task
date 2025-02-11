"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function deleteProjectInvitation(prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");
    const projectId = formData.get("project-id");
    const projectInvitationId = formData.get("project-invitation-id");

    console.log(projectId);

    const res = await fetch(
      `${process.env.API_URL}/project-invitation/${projectInvitationId}?projectId=${projectId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`,
        },
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    revalidateTag("project-invitations");

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
