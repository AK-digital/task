"use server";

import { useAuthFetch } from "@/utils/api";

export async function getPublicBoardsTemplates() {
  try {
    const res = await useAuthFetch(
      `board-template`,
      "GET",
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message ||
      "Une erreur s'est produite lors de la récupération des modèles"
    );
    return {
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la récupération des modèles",
    };
  }
}

export async function getUserPrivateBoardsTemplates() {
  try {
    const res = await useAuthFetch(
      `board-template/user-private`,
      "GET",
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message ||
      "Une erreur s'est produite lors de la récupération des modèles"
    );
    return {
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la récupération des modèles",
    };
  }
}


export async function useBoardTemplate(templateId, projectId) {
  try {
    const res = await useAuthFetch(
      `board-template/use/${templateId}?projectId=${projectId}`,
      "POST",
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message ||
      "Une erreur s'est produite lors de l'utilisation du modèle de tableau"
    );
    return {
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de l'utilisation du modèle de tableau",
    };
  }
}

export async function deleteBoardTemplate(templateId) {
  try {
    const res = await useAuthFetch(
      `board-template/${templateId}`,
      "DELETE",
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message ||
      "Une erreur s'est produite lors de la suppression du modèle de tableau"
    );
    return {
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la suppression du modèle de tableau",
    };
  }
}

export async function updateBoardTemplateVisibility(templateId) {
  try {
    const res = await useAuthFetch(
      `board-template/private/${templateId}`,
      "PATCH",
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la mise à jour de la visibilité du modèle",
    };
  }
}
