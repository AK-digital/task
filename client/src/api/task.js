"use server";
import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";

export async function getTasks(projectId, boardId, archived) {
  try {
    const res = await useAuthFetch(
      `task?projectId=${projectId}&boardId=${boardId}&archived=${archived}`,
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

    revalidateTag("tasks");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
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

    revalidateTag("tasks");

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

    revalidateTag("tasks");

    return response.data;
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

    revalidateTag("project");

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

    revalidateTag("project");

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
  content,
  taggedUsers
) {
  try {
    const rawData = {
      description: content,
      taggedUsers: taggedUsers,
    };

    const res = await useAuthFetch(
      `task/${taskId}/description?projectId=${projectId}`,
      "PATCH",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");

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

export async function taskStartTimer(taskId, projectId) {
  try {
    const res = await useAuthFetch(
      `task/${taskId}/start-timer?projectId=${projectId}`,
      "PATCH",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'enregistrement du timer"
    );
  }
}

export async function taskEndTimer(taskId, projectId) {
  try {
    const res = await useAuthFetch(
      `task/${taskId}/end-timer?projectId=${projectId}`,
      "PATCH",
      "application/json",
      null
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'enregistrement du timer"
    );
  }
}

export async function removeTaskSession(taskId, projectId, sessionId) {
  try {
    const res = await useAuthFetch(
      `task/${taskId}/remove-session?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { sessionId: sessionId }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la suppression du timer"
    );
  }
}
