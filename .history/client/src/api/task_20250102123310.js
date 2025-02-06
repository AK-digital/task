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

    // Cherche le premier statut qui est présent dans formData
    const selectedStatus = statuses.find((status) => formData.get(status));
    if (selectedStatus) {
      data.append("status", selectedStatus);
    }

    console.log(data);
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

    console.log(response);

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
