"use server";

import { revalidateTag } from "next/cache";
import { useAuthFetch } from "@/utils/api";

export async function saveBoard(projectId) {
  try {
    const res = await useAuthFetch(
      `board?projectId=${projectId}`,
      "POST",
      "application/json",
      { title: "Nouveau tableau" }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(
        response?.message ||
          "Une erreur est survenue lors de la création du tableau"
      );
    }

    return response;
  } catch (err) {
    console.log(
      err?.message || "Une erreur est survenue lors de la création du tableau"
    );

    return {
      success: false,
      message:
        err?.message ||
        "Une erreur est survenue lors de la création du tableau",
    };
  }
}

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
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

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
      "application/json"
    );

    const response = await res.json();

    revalidateTag("projects");

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
  }
}

export async function updateBoardOrder() {
  try {
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la mise à jour des tâches"
    );

    return {
      success: false,
      message: err?.message || "Une erreur est survenue lors de la suppression",
    };
  }
}

export async function deleteBoard(boardId, projectId) {
  try {
    if (!boardId) throw new Error("Paramètres manquants");

    const res = await useAuthFetch(
      `board/${boardId}?projectId=${projectId}`,
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
      err.message || "Une erreur est survenue lors de la suppression"
    );

    return {
      success: false,
      message: err?.message || "Une erreur est survenue lors de la suppression",
    };
  }
}
