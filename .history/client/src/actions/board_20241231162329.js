"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function saveBoard(projectId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawFormData = {
      title: formData.get("title"),
    };

    const res = await fetch(
      `${process.env.API_URL}/board?projectId=${projectId}`,
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

    revalidateTag("boards");
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
  }
}

export async function updateBoard(boardId, projectId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    console.log(formData.get("title"));

    const rawFormData = {
      title: formData.get("title"),
    };

    const res = await fetch(
      `${process.env.API_URL}/board/${boardId}?projectId=${projectId}`,
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

    revalidateTag("boards");
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
  }
}
