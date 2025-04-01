"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { useAuthFetch } from "@/utils/api";

export async function getBoards(projectId, archived) {
  try {
    const res = await useAuthFetch(
      `board?projectId=${projectId}&archived=${archived}`,
      "GET",
      "application/json",
      null,
      "boards"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}

export async function addBoardToArchive(boardId, projectId) {
  try {
    if (!boardId) {
      throw new Error("L'id du tableau est requis");
    }

    const res = await useAuthFetch(
      `board/${boardId}/add-archive?projectId=${projectId}`,
      "PATCH",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
  }
}

export async function removeBoardFromArchive(boardId, projectId) {
  try {
    if (!boardId) {
      throw new Error("L'id du tableau est requis");
    }

    const res = await useAuthFetch(
      `board/${boardId}/remove-archive?projectId=${projectId}`,
      "PATCH",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
  }
}

export async function revalidateBoards() {
  revalidateTag("tasks");
  revalidateTag("boards");
  revalidateTag("trackers");
}
