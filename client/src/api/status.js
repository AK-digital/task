"use server";
import { useAuthFetch } from "@/utils/api";

export async function getStatusByProject(projectId) {
  try {
    // Nettoyer l'ID en supprimant les virgules et espaces
    let cleanProjectId = String(projectId);
    cleanProjectId = cleanProjectId.replace(/,/g, ''); // Supprimer les virgules
    cleanProjectId = cleanProjectId.replace(/[^a-zA-Z0-9]/g, ''); // Garder seulement alphanumériques
    
    const res = await useAuthFetch(
      `status/project/${cleanProjectId}`,
      "GET",
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while fetching custom status"
      );
    }

    return response?.data || [];
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message || "An error occurred while fetching custom status",
    };
  }
}

export async function getStatusesByProjects() {
  try {
    const res = await useAuthFetch(`status`, "GET", "application/json");

    if (res.status === 404) {
      return {
        success: false,
        message: "Statuses not found",
        data: [],
      };
    }

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message ||
          "An error occurred while fetching user projects statuses"
      );
    }

    return response?.data || [];
  } catch (err) {
    console.error(err);

    return {
      success: false,
      message: err.message || "An error occurred while fetching custom status",
      data: [],
    };
  }
}

export async function saveStatus(projectId, statusData) {
  try {
    // Nettoyer l'ID en supprimant les virgules et espaces
    const cleanProjectId = String(projectId).replace(/[^a-zA-Z0-9]/g, '');
    
    const res = await useAuthFetch(
      `status?projectId=${cleanProjectId}`,
      "POST",
      "application/json",
      statusData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while saving status"
      );
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message || "An error occurred while saving status",
    };
  }
}

export async function updateStatus(statusId, projectId, statusData) {
  try {
    // Nettoyer les IDs
    const cleanStatusId = String(statusId).replace(/[^a-zA-Z0-9]/g, '');
    const cleanProjectId = String(projectId).replace(/[^a-zA-Z0-9]/g, '');
    
    const res = await useAuthFetch(
      `status/${cleanStatusId}?projectId=${cleanProjectId}`,
      "PUT",
      "application/json",
      statusData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while updating status"
      );
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message || "An error occurred while updating status",
    };
  }
}

export async function deleteStatus(statusId, projectId) {
  try {
    // Nettoyer les IDs
    const cleanStatusId = String(statusId).replace(/[^a-zA-Z0-9]/g, '');
    const cleanProjectId = String(projectId).replace(/[^a-zA-Z0-9]/g, '');
    
    const res = await useAuthFetch(
      `status/${cleanStatusId}?projectId=${cleanProjectId}`,
      "DELETE",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while deleting status"
      );
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message || "An error occurred while deleting status",
    };
  }
}
