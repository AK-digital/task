"use server";
import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";

export async function saveTask(projectId, prevState, formData) {
  try {
    const rawFormData = {
      boardId: formData.get("board-id"),
      text: formData.get("new-task"),
    };

    const res = await useAuthFetch(
      `task?projectId=${projectId}`,
      "POST",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(
        response?.message ||
          "Une erreur est survenue lors de la création de la tâche"
      );
    }

    // revalidateTag("tasks");

    return {
      status: "success",
    };
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );

    return {
      status: "failure",
      message: err.message,
    };
  }
}

// Update the status of a given task
export async function updateTaskStatus(taskId, projectId, status) {
  try {
    const allowedStatus = [
      "En cours",
      "En attente",
      "Terminée",
      "À faire",
      "À vérifier",
      "Bloquée",
    ];

    if (!allowedStatus.includes(status)) throw new Error("Paramètre invalide");

    const rawData = {
      status: status,
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

    return {
      status: "success",
    };
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );

    return {
      status: "failure",
      message: err?.message,
    };
  }
}

// Update the priority of a given task
export async function updateTaskPriority(taskId, projectId, priority) {
  try {
    const allowedPriorities = ["Basse", "Moyenne", "Haute", "Urgent"];

    if (!allowedPriorities.includes(priority)) {
      throw new Error("Paramètre invalide");
    }

    const rawData = {
      priority: priority,
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
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );

    return {
      status: "failure",
      message: err?.message,
    };
  }
}
