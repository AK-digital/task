"use server";
import { useAuthFetch } from "@/utils/api";
import { isNotEmpty } from "@/utils/utils";

export async function getTasks(projectId, archived) {
  try {
    const res = await useAuthFetch(
      `task?projectId=${projectId}&archived=${archived}`,
      "GET",
      "application/json",
      null,
      "tasks"
    );

    if (res.status === 404) {
      return [];
    }

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response?.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function getTask(taskId, projectId) {
  try {
    await useAuthFetch(
      `task/${taskId}?projectId=${projectId}`,
      "GET",
      "application/json",
      null,
      "task"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function addTaskToArchive(tasksIds, projectId) {
  try {
    if (tasksIds.length <= 0) {
      throw new Error("Aucune tâche n'a été séléctionnée");
    }

    const res = await useAuthFetch(
      `task/add-archive?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { tasks: tasksIds }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
  }
}

// Update the text of a given task
export async function updateTaskText(taskId, projectId, text) {
  try {
    if (!text) {
      throw new Error("Paramètres manquants");
    }

    const res = await useAuthFetch(
      `task/${taskId}/text?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { text: text }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Une erreur s'est produite");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );

    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la mise à jour de la tâche",
    };
  }
}

export async function updateTaskDescriptionReactions(taskId, projectId, emoji) {
  try {
    if (!taskId || !projectId || !emoji) {
      return {
        success: false,
        message: "Paramètres invalides pour la mise à jour des réactions",
      };
    }

    const res = await useAuthFetch(
      `task/${taskId}/description/reaction?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { emoji: emoji }
    );

    if (!res.ok) {
      return {
        success: false,
        message: `Erreur HTTP: ${res.status} - ${res.statusText}`,
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour des réactions:", error);
    return {
      success: false,
      message: error.message || "Une erreur est survenue",
    };
  }
}

export async function removeTaskFromArchive(tasksIds, projectId) {
  try {
    if (tasksIds.length <= 0) {
      throw new Error("Aucune tâche n'a été séléctionnée");
    }

    const res = await useAuthFetch(
      `task/remove-archive?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { tasks: tasksIds }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
  }
}

export async function deleteTask(tasksIds, projectId) {
  try {
    if (tasksIds.length <= 0) {
      throw new Error("Aucune tâche n'a été séléctionnée");
    }

    const res = await useAuthFetch(
      `task?projectId=${projectId}`,
      "DELETE",
      "application/json",
      { tasks: tasksIds }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function addResponsible(taskId, responsibleId, projectId) {
  try {
    const rawData = {
      responsibleId: responsibleId,
    };

    const res = await useAuthFetch(
      `task/${taskId}/add-responsible?projectId=${projectId}`,
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
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}

export async function removeResponsible(taskId, responsibleId, projectId) {
  try {
    const rawData = {
      responsibleId: responsibleId,
    };

    const res = await useAuthFetch(
      `task/${taskId}/remove-responsible?projectId=${projectId}`,
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
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}

export async function updateTaskDescription(
  taskId,
  projectId,
  description,
  taggedUsers,
  attachments
) {
  try {
    const data = new FormData();
    data.append("description", description);

    if (isNotEmpty(taggedUsers)) {
      taggedUsers.forEach((taggedUser) => {
        data.append("taggedUsers", taggedUser);
      });
    }

    if (isNotEmpty(attachments)) {
      attachments.forEach((attachment) => {
        if (attachment instanceof File) {
          data.append("attachments", attachment);
        } else {
          data.append(
            "existingFiles",
            JSON.stringify({
              id: attachment.id,
              name: attachment.name,
              url: attachment.url,
            })
          );
        }
      });
    }

    const res = await useAuthFetch(
      `task/${taskId}/description?projectId=${projectId}`,
      "PATCH",
      "multipart/form-data",
      data
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des tableaux"
    );

    return {
      success: false,
      message: err.message,
    };
  }
}

export async function updateTaskOrder(tasks, projectId) {
  try {
    const rawData = {
      tasks: tasks,
    };

    const res = await useAuthFetch(
      `task/reorder?projectId=${projectId}`,
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
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}

export async function updateTaskBoard(taskId, boardId, projectId) {
  try {
    const res = await useAuthFetch(
      `task/${taskId}/update-board?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { boardId: boardId }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}

export async function updateTaskDeadline(taskId, projectId, deadline) {
  try {
    const res = await useAuthFetch(
      `task/${taskId}/deadline?projectId=${projectId}`,
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
        "Une erreur est survenue lors de la mise à jour de la date limite"
    );

    return {
      success: false,
      message: err?.message,
    };
  }
}

export async function updateTaskEstimate(taskId, projectId, estimation) {
  try {
    console.log(estimation);

    const res = await useAuthFetch(
      `task/${taskId}/estimate?projectId=${projectId}`,
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
        "Une erreur est survenue lors de la mise à jour de l'estimation"
    );

    return {
      success: false,
      message: err?.message,
    };
  }
}
