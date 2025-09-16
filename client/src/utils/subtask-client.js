"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Fonction pour obtenir le token depuis les cookies
function getCookieValue(name) {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Créer une sous-tâche (version client)
export async function createSubtaskClient(taskId, title) {
  try {
    console.log("createSubtaskClient called with:", { taskId, title });
    
    const token = getCookieValue('session');
    
    if (!token) {
      throw new Error("Token d'authentification non trouvé");
    }
    
    const response = await fetch(`${API_URL}/subtask/task/${taskId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();
    console.log("createSubtaskClient response:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de la sous-tâche:", error);
    return {
      success: false,
      message: error.message || "Erreur lors de la création de la sous-tâche",
    };
  }
}

// Récupérer les sous-tâches d'une tâche (version client)
export async function getSubtasksClient(taskId) {
  try {
    const token = getCookieValue('session');
    
    if (!token) {
      throw new Error("Token d'authentification non trouvé");
    }
    
    const response = await fetch(`${API_URL}/subtask/task/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des sous-tâches:", error);
    return {
      success: false,
      message: error.message || "Erreur lors de la récupération des sous-tâches",
    };
  }
}

// Mettre à jour une sous-tâche (version client)
export async function updateSubtaskClient(subtaskId, updates) {
  try {
    const token = getCookieValue('session');
    
    if (!token) {
      throw new Error("Token d'authentification non trouvé");
    }
    
    const response = await fetch(`${API_URL}/subtask/${subtaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la sous-tâche:", error);
    return {
      success: false,
      message: error.message || "Erreur lors de la mise à jour de la sous-tâche",
    };
  }
}

// Supprimer une sous-tâche (version client)
export async function deleteSubtaskClient(subtaskId) {
  try {
    const token = getCookieValue('session');
    
    if (!token) {
      throw new Error("Token d'authentification non trouvé");
    }
    
    const response = await fetch(`${API_URL}/subtask/${subtaskId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

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
