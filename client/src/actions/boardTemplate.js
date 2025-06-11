"use server";

import { useAuthFetch } from "@/utils/api";

export async function saveBoardTemplate(prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const boardId = formData.get("board-id");
    const name = formData.get("template-name");
    const isPrivate = formData.get("template-private");

    const res = await useAuthFetch(
      `board-template?projectId=${projectId}`,
      "POST",
      "application/json",
      {
        boardId: boardId,
        name: name,
        isPrivate: isPrivate !== "on",
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response?.message ||
        "Une erreur est survenue lors de la création du modèle de tableau"
      );
    }

    return response;
  } catch (err) {
    console.error(
      err.message ||
      "Une erreur est survenue lors de la création du modèle de tableau"
    );
    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la création du modèle de tableau",
    };
  }
}
