"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function getProject(id) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/project/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["project"] } }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function revalidateProject(id) {
  revalidateTag(`project-${id}`);
  revalidateTag("project-invitations");
}

export async function getProjects() {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(`${process.env.API_URL}/project`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.value}`,
      },
      next: { tags: ["projects"] },
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function updateProjectLogo(projectId, logo) {
  try {
    const cookie = await cookies();
    const session = cookie?.get("session");

    if (!logo || logo.size === 0) {
      return {
        status: "failure",
        message: "Aucun fichier sélectionné",
      };
    }

    // Vérification du type de fichier
    if (!logo.type.startsWith("image/")) {
      return {
        status: "failure",
        message: "Le fichier doit être une image",
      };
    }

    const formDataToSend = new FormData();
    formDataToSend.append("logo", logo);

    const res = await fetch(
      `${process.env.API_URL}/project/${projectId}/logo`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${session?.value}`,
        },
        body: formDataToSend,
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response?.message || "Une erreur inattendue est survenue"
      );
    }

    revalidateTag("projects");

    return {
      status: "success",
      message: "Le logo a été mis à jour avec succès",
      data: response.data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour du logo :", err);
    return {
      status: "failure",
      message:
        "Une erreur inattendue est survenue lors de la mise à jour du logo",
    };
  }
}

export async function deleteProject(projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(`${process.env.API_URL}/project/${projectId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.value}`,
      },
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return response;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}
