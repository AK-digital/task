"use server";

import { useAuthFetch } from "@/utils/api";

export async function sendFeedback(prevState, formData) {
  try {
    const message = formData.get("message");

    const response = useAuthFetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    if (!response.success) {
      return {
        success: false,
        message: response.message,
      };
    }

    return { success: true, message: "Feedback envoyé avec succès" };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    };
  }
}
