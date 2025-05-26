"use server";
import { useAuthFetch } from "@/utils/api";

export async function createBoard(projectId, title, color = "#2d7ff9") {
  try {
    const rawFormData = {
      title: title,
      color: color,
    };

    const res = await useAuthFetch(
      `board?projectId=${projectId}`,
      "POST",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response?.message ||
          "Une erreur est survenue lors de la création du tableau"
      );
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la création du tableau",
    };
  }
}

export async function updateBoard(boardId, projectId, color, title) {
  try {
    const rawFormData = {
      title: title,
      color: color,
    };

    const res = await useAuthFetch(
      `board/${boardId}?projectId=${projectId}`,
      "PUT",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response?.message ||
          "Une erreur est survenue lors de la mise à jour du tableau"
      );
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la mise à jour du tableau"
    );
    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la mise à jour du tableau",
    };
  }
}
