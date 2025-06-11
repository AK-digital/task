"use server";

import { useAuthFetch } from "@/utils/api";
import { feedbackValidation } from "@/utils/zod";

export async function sendFeedback(note, prevState, formData) {
  try {
    const message = formData.get("message");

    if (!note) {
      return {
        success: false,
        message: "Veuillez sélectionner une note",
        errors: {
          note: "Veuillez sélectionner une note",
        },
      };
    }

    if (!message) {
      return {
        success: false,
        message: "Veuillez entrer un message",
        errors: {
          message: "Veuillez entrer un message",
        },
      };
    }

    const validation = feedbackValidation.safeParse({ message });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0].message,
        errors: {
          message: validation.error.errors[0].message,
        },
      };
    }

    const res = await useAuthFetch("feedback", "POST", "application/json", {
      note: note,
      message: message,
    });

    const response = await res.json();

    if (!response.success) {
      return {
        success: false,
        message: response.message,
      };
    }

    return { success: true, message: "Feedback envoyé avec succès" };
  } catch (err) {
    if (err.message === "Missing parameters") {
      return {
        success: false,
        message: "Veuillez sélectionner une note et entrer un message",
        errors: {
          note: "Veuillez sélectionner une note",
          message: "Veuillez entrer un message",
        },
      };
    }

    return {
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    };
  }
}
