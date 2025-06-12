"use server";
import { useAuthFetch } from "@/utils/api";

export async function getStatusByProject(projectId) {
  try {
    const res = await useAuthFetch(
      `status/project/${projectId}`,
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
    const res = await useAuthFetch(
      `status?projectId=${projectId}`,
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
    const res = await useAuthFetch(
      `status/${statusId}?projectId=${projectId}`,
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
    const res = await useAuthFetch(
      `status/${statusId}?projectId=${projectId}`,
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
