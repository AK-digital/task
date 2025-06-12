"use server";
import { useAuthFetch } from "@/utils/api";

export async function getPriorityByProject(projectId) {
  try {
    const res = await useAuthFetch(
      `priority/project/${projectId}`,
      "GET",
      "application/json",
      null
    );

    if (!res.ok) {
      throw new Error("Failed to fetch custom priority");
    }

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while fetching custom priority"
      );
    }

    return response?.data || [];
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message:
        err.message || "An error occurred while fetching custom priority",
    };
  }
}

export async function savePriority(projectId, priorityData) {
  try {
    const res = await useAuthFetch(
      `priority?projectId=${projectId}`,
      "POST",
      "application/json",
      priorityData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while saving priority"
      );
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message || "An error occurred while saving priority",
    };
  }
}

export async function updatePriority(priorityId, projectId, priorityData) {
  try {
    const res = await useAuthFetch(
      `priority/${priorityId}?projectId=${projectId}`,
      "PUT",
      "application/json",
      priorityData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while updating priority"
      );
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message || "An error occurred while updating priority",
    };
  }
}

export async function deletePriority(priorityId, projectId) {
  try {
    const res = await useAuthFetch(
      `priority/${priorityId}?projectId=${projectId}`,
      "DELETE",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response.message || "An error occurred while deleting priority"
      );
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: err.message || "An error occurred while deleting priority",
    };
  }
}
