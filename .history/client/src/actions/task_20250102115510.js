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
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
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
