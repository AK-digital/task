"use server";
import { useAuthFetch } from "@/utils/api";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getProject(id) {
  try {
    const res = await useAuthFetch(
      `project/${id}`,
      "GET",
      "application/json",
      null,
      "project"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    console.log(response?.data?.members);

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function revalidateProject(id) {
  revalidateTag(`project`);
  revalidateTag("project-invitations");
}

export async function getProjects() {
  try {
    const res = await useAuthFetch(
      "project",
      "GET",
      "application/json",
      null,
      "projects"
    );

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

    const res = await useAuthFetch(
      `project/${projectId}/logo`,
      "PATCH",
      "multipart/form-data",
      formDataToSend
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

export async function updateProjectRole(projectId, memberId, role) {
  try {
    const res = await useAuthFetch(
      `project/${projectId}/update-role`,
      "PATCH",
      "application/json",
      { memberId, role }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(
        response?.message || "Une erreur inattendue est survenue"
      );
    }

    revalidateTag("projects");

    return response;
  } catch (err) {
    console.log(
      err?.message || "Une erreur est survenue lors de la mise à jour du rôle"
    );

    return {
      status: "failure",
      message: err?.message || "Une erreur est survenue lors de la mise à jour",
    };
  }
}

export async function deleteProject(projectId) {
  try {
    const res = await useAuthFetch(`project/${projectId}`, "DELETE");

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

export async function revalidatePage() {
  revalidatePath("/projects");
  revalidatePath("/time-trackings");
}
