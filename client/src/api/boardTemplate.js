"use server";

import { useAuthFetch } from "@/utils/api";

export async function getBoardsTemplates() {
  try {
    const res = await useAuthFetch("board-template", "GET", "application/json");

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

export async function useBoardTemplate(templateId) {
  try {
    const res = await useAuthFetch(
      `board-template/use/${templateId}`,
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
