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

export async function updateTask(taskId, projectId, data) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const formData = new FormData();
    // Ajoutez chaque champ de l'objet data au FormData
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    console.log(formData);

    const res = await fetch(
      `${process.env.API_URL}/task/${taskId}?projectId=${projectId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: formData, // Utilisez l'objet FormData comme body
      }
    );

    const response = await res.json();

    console.log(response);

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

export async function deleteTask(projectId, boardId) {
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
