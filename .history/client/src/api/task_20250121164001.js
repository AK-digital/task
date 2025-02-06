"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function getTasks(projectId, boardId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task?projectId=${projectId}&boardId=${boardId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["tasks"] } }
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

export async function deleteTask(taskId, projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}?projectId=${projectId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
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

export async function updateDescription(taskId, projectId, content) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    console.log(content);

    const rawData = {
      description: content,
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

    revalidateTag("project");

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}
