"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getSession } from "./auth";

export async function getBoards(projectId, archived) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/board?projectId=${projectId}&archived=${archived}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["boards"] } }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}

export async function addBoardToArchive(boardId, projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    if (!boardId) {
      throw new Error("L'id du tableau est requis");
    }

    const res = await fetch(
      `${process.env.API_URL}/board/${boardId}/add-archive?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
  }
}

export async function removeBoardFromArchive(boardId, projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    if (!boardId) {
      throw new Error("L'id du tableau est requis");
    }

    const res = await fetch(
      `${process.env.API_URL}/board/${boardId}/remove-archive?projectId=${projectId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("projects");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'archivage des tâches"
    );
  }
}

export async function revalidateBoards() {
  console.log("revalidate played");
  revalidateTag("projects");
  revalidateTag("boards");
}
