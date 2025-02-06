"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function saveTask(projectId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawFormData = {
      boardId: formData.get("board-id"),
      text: formData.get("new-task"),
    };

    const res = await fetch(
      `${process.env.API_URL}/task?projectId=${projectId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawFormData),
      }
    );

    const response = await res.json();

    console.log(response);

    revalidateTag("tasks");

    return {
      status: "success",
    };
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
  }
}

export async function updateTask(taskId, projectId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const data = new FormData();

    const statuses = [
      "En attente",
      "À faire",
      "En cours",
      "Bloquée",
      "Terminée",
    ];

    const priorities = ["Basse", "Moyenne", "Haute", "Urgent"];

    const selectedStatus = statuses.find((status) => formData.get(status));
    if (selectedStatus) {
      data.append("status", selectedStatus);
    }

    const selectedPriority = priorities.find((priority) =>
      formData.get(priority)
    );
    if (selectedPriority) {
      data.append("priority", selectedPriority);
    }

    data.append("text", formData.get("text"));
    data.append("deadline", formData.get("deadline"));
    data.append("description");

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}?projectId=${projectId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: data, // Utilisez l'objet FormData comme body
      }
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
    };
  }
}

// Update the text of a given task
export async function updateTaskText(taskId, projectId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const text = formData.get("text");

    if (!text) {
      throw new Error("Paramètres manquants");
    }

    const rawData = {
      text: text,
    };

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/text?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData), // Utilisez l'objet FormData comme body
      }
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

// Update the status of a given task
export async function updateTaskStatus(taskId, projectId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const status = formData.get("status");

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

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/status?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData), // Utilisez l'objet FormData comme body
      }
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

export async function updateTaskPriority(
  taskId,
  projectId,
  prevState,
  formData
) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const priority = formData.get("priority");

    const allowedPriorities = ["Basse", "Moyenne", "Haute", "Urgent"];

    if (!allowedPriorities.includes(statuprioritys)) {
      throw new Error("Paramètre invalide");
    }

    const rawData = {
      priority: priority,
    };

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/status?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData), // Utilisez l'objet FormData comme body
      }
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
