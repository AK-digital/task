"use server";
import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";

export async function saveBoard(projectId, prevState, formData) {
  try {
    const rawFormData = {
      title: formData.get("title"),
    };

    const res = await useAuthFetch(
      `board?projectId=${projectId}`,
      "POST",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    revalidateTag("boards");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
  }
}

export async function updateBoard(boardId, projectId, color, title) {
  try {
    const rawFormData = {
      title: title,
      color: color,
    };

    const res = await useAuthFetch(
      `board/${boardId}?projectId=${projectId}`,
      "PUT",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    revalidateTag("boards");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
  }
}

export async function deleteBoard(boardId, projectId) {
  try {
    const res = await useAuthFetch(
      `board/${boardId}?projectId=${projectId}`,
      "DELETE",
      "application/json"
    );

    const response = await res.json();

    revalidateTag("boards");
    revalidateTag("tasks");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la suppression du tableau"
    );
  }
}
