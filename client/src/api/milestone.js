"use server";
import { useAuthFetch } from "@/utils/api";

// Récupérer tous les jalons d'un projet avec leurs statistiques
export async function getMilestones(projectId) {
  try {
    const res = await useAuthFetch(
      `/milestone?projectId=${projectId}`,
      "GET",
      "application/json",
      null,
      "milestones"
    );

    if (res.status === 404) {
      return [];
    }

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response?.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des jalons"
    );
    return [];
  }
}

// Créer un nouveau jalon
export async function saveMilestone(projectId, milestoneData) {
  try {
    const res = await useAuthFetch(
      `/milestone?projectId=${projectId}`,
      "POST",
      "application/json",
      { projectId, ...milestoneData }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du jalon"
    );
    return {
      success: false,
      message: err.message || "Une erreur est survenue lors de la création du jalon",
    };
  }
}

// Mettre à jour un jalon
export async function updateMilestone(milestoneId, milestoneData) {
  try {
    const res = await useAuthFetch(
      `/milestone/${milestoneId}`,
      "PUT",
      "application/json",
      milestoneData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la mise à jour du jalon"
    );
    return {
      success: false,
      message: err.message || "Une erreur est survenue lors de la mise à jour du jalon",
    };
  }
}

// Supprimer un jalon
export async function deleteMilestone(milestoneId, projectId) {
  try {
    const res = await useAuthFetch(
      `/milestone/${milestoneId}?projectId=${projectId}`,
      "DELETE"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la suppression du jalon"
    );
    return {
      success: false,
      message: err.message || "Une erreur est survenue lors de la suppression du jalon",
    };
  }
}

// Assigner un board à un jalon
export async function assignBoardToMilestone(boardId, milestoneId, projectId) {
  try {
    const res = await useAuthFetch(
      `/milestone/assign-board?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { boardId, milestoneId }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'assignation du tableau"
    );
    return {
      success: false,
      message: err.message || "Une erreur est survenue lors de l'assignation du tableau",
    };
  }
}

// Réorganiser les jalons
export async function reorderMilestones(milestones, projectId) {
  try {
    const res = await useAuthFetch(
      `/milestone/reorder?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { milestones }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la réorganisation des jalons"
    );
    return {
      success: false,
      message: err.message || "Une erreur est survenue lors de la réorganisation des jalons",
    };
  }
}

// Recalculer les statistiques des jalons d'un projet
export async function recalculateMilestones(projectId) {
  try {
    const res = await useAuthFetch(
      `/milestone/recalculate?projectId=${projectId}`,
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
      err.message || "Une erreur est survenue lors du recalcul des jalons"
    );
    return {
      success: false,
      message: err.message || "Une erreur est survenue lors du recalcul des jalons",
    };
  }
}
