"use server";
import { useAuthFetch } from "@/utils/api";

// Action pour créer une sous-tâche via useActionState
export async function saveSubtask(taskId, prevState, formData) {
  try {
    const title = formData.get("subtask-title");

    if (!taskId || !title) {
      throw new Error("Paramètres manquants");
    }

    const res = await useAuthFetch(
      `subtask/task/${taskId}`,
      "POST",
      "application/json",
      { title: title }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(
        response?.message ||
          "Une erreur est survenue lors de la création de la sous-tâche"
      );
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création de la sous-tâche"
    );

    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la création de la sous-tâche",
    };
  }
}
