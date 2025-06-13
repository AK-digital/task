"use server";

import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";

export async function saveBoardTemplate(prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const boardId = formData.get("board-id");
    const name = formData.get("template-name");
    const isPrivate = formData.get("template-private");

    const res = await useAuthFetch(
      `board-template?projectId=${projectId}`,
      "POST",
      "application/json",
      {
        boardId: boardId,
        name: name,
        isPrivate: isPrivate !== "on",
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    revalidateTag("templates");

    return {
      status: "success",
      message: "board_template.create.success",
      data: response.data,
    };
  } catch (err) {
    console.log(err.message || "board_template.create.error");
    return {
      status: "failure",
      message: err.message || "board_template.create.error",
    };
  }
}
