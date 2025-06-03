"use server";
import { useAuthFetch } from "@/utils/api";
import { allowedStatus } from "@/utils/utils";

export async function saveTask(projectId, prevState, formData, t) {
  try {
    const boardId = formData.get("board-id");
    const text = formData.get("new-task");

    if (!projectId || !boardId || !text) {
      throw new Error(t("task.missing_parameters"));
    }

    const res = await useAuthFetch(
      `task?projectId=${projectId}`,
      "POST",
      "application/json",
      { boardId: boardId, text: text }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || t("task.create.error"));
    }

    return response;
  } catch (err) {
    console.log(err.message || t("task.create.error"));

    return {
      success: false,
      message: err.message || t("task.create.error"),
    };
  }
}

// Update the status of a given task
export async function updateTaskStatus(taskId, projectId, statusId, t) {
  try {
    const rawData = {
      statusId: statusId,
    };

    const res = await useAuthFetch(
      `task/${taskId}/status?projectId=${projectId}`,
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
    console.log(err.message || t("task.status.update.error"));

    return {
      success: false,
      message: err?.message || t("common.error"),
    };
  }
}

// Update the priority of a given task
export async function updateTaskPriority(taskId, projectId, priorityId, t) {
  try {
    const rawData = {
      priorityId: priorityId,
    };

    const res = await useAuthFetch(
      `task/${taskId}/priority?projectId=${projectId}`,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
    };
  } catch (err) {
    console.log(err.message || t("task.priority.update.error"));

    return {
      status: "failure",
      message: err?.message,
    };
  }
}
