"use server";

import { cookies } from "next/headers";

export async function getProjectInvitations(projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/project-invitation/${projectId}?projectId=${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`,
        },
      },
      { next: { tags: ["project-invitations"] } }
    );

    const response = await res.json();

    if (!response.success) {
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
