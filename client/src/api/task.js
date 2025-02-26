"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function getTasks(projectId, boardId, archived) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task?projectId=${projectId}&boardId=${boardId}&archived=${archived}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["tasks"] } }
    );

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
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}?projectId=${projectId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["task"] } }
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
    const cookie = await cookies();
    const session = cookie.get("session");

    if (tasksIds.length <= 0) {
      throw new Error("Aucune tâche n'a été séléctionnée");
    }

    const res = await fetch(
      `${process.env.API_URL}/task/add-archive?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify({ tasks: tasksIds }),
      }
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
    const cookie = await cookies();
    const session = cookie.get("session");

    if (tasksIds.length <= 0) {
      throw new Error("Aucune tâche n'a été séléctionnée");
    }

    const res = await fetch(
      `${process.env.API_URL}/task/remove-archive?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify({ tasks: tasksIds }),
      }
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
    const cookie = await cookies();
    const session = cookie.get("session");

    if (tasksIds.length <= 0) {
      throw new Error("Aucune tâche n'a été séléctionnée");
    }

    const res = await fetch(
      `${process.env.API_URL}/task?projectId=${projectId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify({ tasks: tasksIds }),
      }
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
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawData = {
      responsibleId: responsibleId,
    };

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/add-responsible?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    const response = await res.json();

    console.log(response);

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
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawData = {
      responsibleId: responsibleId,
    };

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/remove-responsible?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    const response = await res.json();

    console.log(response);

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

export async function updateDescription(
  taskId,
  projectId,
  content,
  taggedUsers
) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawData = {
      description: content,
      taggedUsers: taggedUsers,
    };

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/description?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    const response = await res.json();

    console.log(response);

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
  }
}

export async function updateTaskOrder(tasks, projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawData = {
      tasks: tasks,
    };

    const res = await fetch(
      `${process.env.API_URL}/task/reorder?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
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
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/update-board?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify({ boardId: boardId }),
      }
    );

    const response = await res.json();

    console.log(response);

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
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/start-timer?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
      }
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
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/end-timer?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
      }
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
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}/remove-session?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify({ sessionId: sessionId }),
      }
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
