"use server";
import { useAuthFetch } from "@/utils/api";

export async function updateBoard(boardId, projectId, color, title, t) {
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
      throw new Error(response?.message || t("board.update.error"));
    }

    return response;
  } catch (err) {
    console.log(err.message || t("board.update.error"));
    return {
      success: false,
      message: err.message || t("board.update.error"),
    };
  }
}
