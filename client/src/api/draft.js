"use server";

import { useAuthFetch } from "@/utils/api";

export async function getDrafts(projectId, type) {
  try {
    const response = await useAuthFetch(
      `/draft?projectId=${projectId}&type=${type}`,
      "GET",
      "application/json",
      null,
      "drafts"
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data?.message);
    }

    return data;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur est survenue lors de la récupération des brouillons"
    );

    return {
      success: false,
      message: "Une erreur est survenue lors de la récupération des brouillons",
    };
  }
}

export async function saveDraft(projectId, taskId, type, content) {
  try {
    if (!projectId || !type || !content) {
      throw new Error("Paramètres manquants");
    }

    const response = await useAuthFetch(
      `/draft?projectId=${projectId}`,
      "POST",
      "application/json",
      { type: type, taskId: taskId, content: content }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data?.message);
    }

    return data;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur est survenue lors de la sauvegarde du brouillon"
    );

    return {
      success: false,
      message: "  Une erreur est survenue lors de la sauvegarde du brouillon",
    };
  }
}

export async function updateDraft(draftId, projectId, content) {
  try {
    if (!draftId || !projectId || !content) {
      throw new Error("Paramètres manquants");
    }

    const response = await useAuthFetch(
      `/draft/${draftId}?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { content: content }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data?.message);
    }

    return data;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur est survenue lors de la mise à jour du brouillon"
    );

    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du brouillon",
    };
  }
}

export async function deleteDraft(draftId, projectId) {
  try {
    if (!draftId || !projectId) {
      throw new Error("Paramètres manquants");
    }

    const response = await useAuthFetch(
      `/draft/${draftId}?projectId=${projectId}`,
      "DELETE",
      "application/json",
      null
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data?.message);
    }

    return data;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur est survenue lors de la suppression du brouillon"
    );

    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression du brouillon",
    };
  }
}
