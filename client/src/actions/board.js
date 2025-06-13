"use server";
import { useAuthFetch } from "@/utils/api";

export async function createBoard(projectId, title, color = "#2d7ff9") {
  try {
    const rawFormData = {
      title: title,
      color: color,
    };

    const res = await useAuthFetch(
      `board?projectId=${projectId}`,
      "POST",
      "application/json",
      rawFormData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "board.create.error");
    }

    return response;
  } catch (err) {
    console.log(err.message || "board.create.error");
    return {
      success: false,
      message: err.message || "board.create.error",
    };
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

    if (!response.success) {
      throw new Error(response?.message || "board.update.error");
    }

    return response;
  } catch (err) {
    console.log(err.message || "board.update.error");
    return {
      success: false,
      message: err.message || "board.update.error",
    };
  }
}
