"use server";
import { useAuthFetch } from "@/utils/api";

// Créer une sous-tâche
export async function createSubtask(taskId, title, projectId) {
  try {
    console.log("createSubtask called with:", { 
      taskId, 
      title, 
      projectId,
      typeof_taskId: typeof taskId,
      typeof_title: typeof title,
      typeof_projectId: typeof projectId,
      taskId_stringified: JSON.stringify(taskId),
      title_stringified: JSON.stringify(title)
    });
    
    // Next.js server actions peuvent recevoir les paramètres différemment
    let actualTaskId = taskId;
    let actualTitle = title;
    let actualProjectId = projectId;
    
    // Si le premier argument est un objet, extraire les paramètres
    if (typeof taskId === 'object' && taskId !== null) {
      console.log("taskId est un objet:", taskId);
      actualTaskId = taskId.taskId || taskId[0];
      actualTitle = taskId.title || title;
      actualProjectId = taskId.projectId || projectId;
    }
    
    // Si taskId est un array (comportement Next.js server actions)
    if (Array.isArray(taskId)) {
      console.log("taskId est un array:", taskId);
      actualTaskId = taskId[0];
      actualTitle = taskId[1] || title;
      actualProjectId = taskId[2] || projectId;
    }
    
    console.log("Paramètres après traitement:", { actualTaskId, actualTitle, actualProjectId });
    
    if (!actualTaskId || !actualTitle || !actualProjectId) {
      console.log("Paramètres manquants après traitement:", { actualTaskId, actualTitle, actualProjectId });
      return {
        success: false,
        message: "Paramètres manquants",
      };
    }

    console.log("Appel useAuthFetch avec:", {
      url: `subtask/task/${actualTaskId}?projectId=${actualProjectId}`,
      method: "POST",
      body: { title: actualTitle }
    });

    const response = await useAuthFetch(
      `subtask/task/${actualTaskId}?projectId=${actualProjectId}`,
      "POST",
      "application/json",
      { title: actualTitle }
    );

    console.log("Réponse useAuthFetch:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    const data = await response.json();
    console.log("createSubtask response:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de la sous-tâche:", error);
    return {
      success: false,
      message: "Erreur lors de la création de la sous-tâche",
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la sous-tâche:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression de la sous-tâche",
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