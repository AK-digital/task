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

    revalidateTag("tasks");

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

// Update the text of a given task
export async function updateTaskText(taskId, projectId, prevState, formData) {
  try {
    const text = formData.get("text");

    if (!text) {
      throw new Error("Paramètres manquants");
    }

    const rawData = {
      text: text,
    };

    const res = await useAuthFetch(
      `task/${taskId}/text?projectId=${projectId}`,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    revalidateTag("tasks");

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

// Update the status of a given task
export async function updateTaskStatus(taskId, projectId, status) {
  try {
    const allowedStatus = [
      "En attente",
      "À faire",
      "En cours",
      "Bloquée",
      "Terminée",
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

    revalidateTag("tasks");

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

    revalidateTag("tasks");

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

export async function updateTaskDeadline(
  taskId,
  projectId,
  prevState,
  formData
) {
  try {
    const deadline = formData.get("deadline");

    if (!deadline) throw new Error("Paramètre manquant");

    const rawData = {
      deadline: deadline,
    };

    const res = await useAuthFetch(
      `task/${taskId}/deadline?projectId=${projectId}`,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    revalidateTag("tasks");

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

export async function addTaskSession(taskId, projectId, prevState, formData) {
  try {
    const date = formData.get("date");
    const startTime = formData.get("start-time");
    const endTime = formData.get("end-time");

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const rawData = {
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
    };

    const res = await useAuthFetch(
      `task/${taskId}/add-session?projectId=${projectId}`,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");

    return {
      status: "success",
      message: "Le timer a été enregistré avec succès",
      data: response?.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || "Une erreur est survenue",
    };
  }
}
