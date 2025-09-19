"use server";
import { useAuthFetch } from "@/utils/api";
import { 
  withErrorHandling, 
  optimizedApiCall,
  getGlobalBatchProcessor 
} from "@/utils/optimizedActions";

// Fonction unifiée optimisée pour mettre à jour le statut (tâche ou sous-tâche)
export async function updateStatus(id, projectId, statusId, type = 'task') {
  return withErrorHandling(async () => {
    const endpoint = type === 'subtask' 
      ? `subtask/${id}/status` 
      : `task/${id}/status?projectId=${projectId}`;
    
    const rawData = { statusId };

    // Utiliser le batch processor pour les mises à jour multiples
    const batchProcessor = await getGlobalBatchProcessor();
    const operation = () => optimizedApiCall(
      endpoint,
      "PATCH",
      "application/json",
      rawData,
      { retries: 2, timeout: 5000 }
    );

    const res = await batchProcessor.add(operation);
    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  }, `updateStatus_${type}`);
}

// Fonction unifiée pour mettre à jour la priorité (tâche ou sous-tâche)
export async function updatePriority(id, projectId, priorityId, type = 'task') {
  try {
    const endpoint = type === 'subtask' 
      ? `subtask/${id}/priority` 
      : `task/${id}/priority?projectId=${projectId}`;
    
    const rawData = {
      priorityId: priorityId,
    };

    const res = await useAuthFetch(
      endpoint,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        `Une erreur est survenue lors de la mise à jour de la priorité de la ${type === 'subtask' ? 'sous-tâche' : 'tâche'}`
    );

    return {
      success: false,
      message: err?.message || "Une erreur est survenue",
    };
  }
}

// Fonction unifiée pour mettre à jour la deadline (tâche ou sous-tâche)
export async function updateDeadline(id, projectId, deadline, type = 'task') {
  try {
    const endpoint = type === 'subtask' 
      ? `subtask/${id}/deadline` 
      : `task/${id}/deadline?projectId=${projectId}`;

    const res = await useAuthFetch(
      endpoint,
      "PATCH",
      "application/json",
      { deadline: deadline }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        `Une erreur est survenue lors de la mise à jour de la deadline de la ${type === 'subtask' ? 'sous-tâche' : 'tâche'}`
    );

    return {
      success: false,
      message: err?.message,
    };
  }
}

// Fonction unifiée pour mettre à jour l'estimation (tâche ou sous-tâche)
export async function updateEstimate(id, projectId, estimation, type = 'task') {
  try {
    if (!id || (!projectId && type === 'task')) {
      throw new Error(
        "Paramètres invalides pour la mise à jour de l'estimation"
      );
    }

    const endpoint = type === 'subtask' 
      ? `subtask/${id}/estimate` 
      : `task/${id}/estimate?projectId=${projectId}`;

    const res = await useAuthFetch(
      endpoint,
      "PATCH",
      "application/json",
      { estimation: estimation }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        `Une erreur est survenue lors de la mise à jour de l'estimation de la ${type === 'subtask' ? 'sous-tâche' : 'tâche'}`
    );

    return {
      success: false,
      message: err?.message,
    };
  }
}

// Fonction unifiée pour ajouter un responsable (tâche ou sous-tâche)
export async function addResponsible(id, projectId, responsibleId, type = 'task') {
  try {
    const endpoint = type === 'subtask' 
      ? `subtask/${id}/add-responsible` 
      : `task/${id}/add-responsible?projectId=${projectId}`;
    
    const rawData = {
      responsibleId: responsibleId,
    };

    const res = await useAuthFetch(
      endpoint,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        `Une erreur est survenue lors de l'ajout du responsable à la ${type === 'subtask' ? 'sous-tâche' : 'tâche'}`
    );

    return {
      success: false,
      message: err.message || "Une erreur est survenue",
    };
  }
}

// Fonction unifiée pour supprimer un responsable (tâche ou sous-tâche)
export async function removeResponsible(id, projectId, responsibleId, type = 'task') {
  try {
    const endpoint = type === 'subtask' 
      ? `subtask/${id}/remove-responsible` 
      : `task/${id}/remove-responsible?projectId=${projectId}`;
    
    const rawData = {
      responsibleId: responsibleId,
    };

    const res = await useAuthFetch(
      endpoint,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        `Une erreur est survenue lors de la suppression du responsable de la ${type === 'subtask' ? 'sous-tâche' : 'tâche'}`
    );

    return {
      success: false,
      message: err.message || "Une erreur est survenue",
    };
  }
}
