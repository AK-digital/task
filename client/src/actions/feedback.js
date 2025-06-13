"use server";

import { useAuthFetch } from "@/utils/api";
import { feedbackValidation } from "@/utils/zod";

export async function sendFeedback(note, prevState, formData) {
  try {
    const message = formData.get("message");

    if (!note) {
      return {
        success: false,
        message: "feedback.note_required",
        errors: {
          note: "feedback.note_required",
        },
      };
    }

    if (!message) {
      return {
        success: false,
        message: "feedback.message_required",
        errors: {
          message: "feedback.message_required",
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

    return { success: true, message: "feedback.success_message" };
  } catch (err) {
    if (err.message === "Missing parameters") {
      return {
        success: false,
        message: "feedback.missing_parameters",
        errors: {
          note: "feedback.note_required",
          message: "feedback.message_required",
        },
      };
    }

    return {
      success: false,
      message: err.message || "feedback.unexpected_error",
    };
  }
}
