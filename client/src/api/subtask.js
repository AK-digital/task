"use server";
import { useAuthFetch } from "@/utils/api";

// Créer une sous-tâche
export async function createSubtask(taskId, title, projectId) {
  try {
    
    // Next.js server actions peuvent recevoir les paramètres différemment
    let actualTaskId = taskId;
    let actualTitle = title;
    let actualProjectId = projectId;
    
    if (!actualTaskId || !actualTitle || !actualProjectId) {
      return {
        success: false,
        message: "Paramètres manquants",
      };
    }

    const response = await useAuthFetch(
      `subtask/task/${actualTaskId}?projectId=${actualProjectId}`,
      "POST",
      "application/json",
      { title: actualTitle }
    );

    if (!response.ok) {
      return {
        success: false,
        message: `Erreur HTTP: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de la sous-tâche:", error);
    return {
      success: false,
      message: error.message || "Erreur lors de la création de la sous-tâche",
    };
  }
}

// Récupérer les sous-tâches d'une tâche
export async function getSubtasks(taskId) {
  try {
    if (!taskId) {
      return {
        success: false,
        message: "ID de tâche manquant",
      };
    }

    const response = await useAuthFetch(
      `subtask/task/${taskId}`,
      "GET",
      "application/json"
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des sous-tâches:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des sous-tâches",
    };
  }
}

// Mettre à jour une sous-tâche
export async function updateSubtask(subtaskId, updates) {
  try {
    if (!subtaskId || !updates) {
      return {
        success: false,
        message: "Paramètres manquants",
      };
    }

    const response = await useAuthFetch(
      `subtask/${subtaskId}`,
      "PUT",
      "application/json",
      updates
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la sous-tâche:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour de la sous-tâche",
    };
  }
}

// Mettre à jour la description d'une sous-tâche
export async function updateSubtaskDescription(subtaskId, description, taggedUsers = [], attachments = []) {
  try {
    const response = await useAuthFetch(
      `subtask/${subtaskId}/description`,
      "PATCH",
      "application/json",
      { description, taggedUsers, attachments }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour de la description");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur updateSubtaskDescription:", error);
    return {
      success: false,
      message: error.message || "Une erreur est survenue"
    };
  }
}

// Supprimer une sous-tâche
export async function deleteSubtask(subtaskId) {
  try {
    if (!subtaskId) {
      return {
        success: false,
        message: "ID de sous-tâche manquant",
      };
    }

    const response = await useAuthFetch(
      `subtask/${subtaskId}`,
      "DELETE",
      "application/json"
    );

    if (!response.ok) {
      return {
        success: false,
        message: `Erreur HTTP: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la sous-tâche:", error);
    return {
      success: false,
      message: error.message || "Erreur lors de la suppression de la sous-tâche",
    };
  }
}

// Réorganiser les sous-tâches
export async function reorderSubtasks(taskId, subtasks) {
  try {
    if (!taskId || !subtasks) {
      return {
        success: false,
        message: "Paramètres manquants",
      };
    }

    const response = await useAuthFetch(
      `subtask/task/${taskId}/reorder`,
      "PUT",
      "application/json",
      { subtasks }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la réorganisation des sous-tâches:", error);
    return {
      success: false,
      message: "Erreur lors de la réorganisation des sous-tâches",
    };
  }
}