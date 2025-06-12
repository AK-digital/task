"use server";
import { useAuthFetch } from "@/utils/api";

export async function saveTemplate(prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const name = formData.get("template-name");
    const isPrivate = formData.get("template-private");

    const res = await useAuthFetch(
      `template?projectId=${projectId}`,
      "POST",
      "application/json",
      {
        projectId: projectId,
        name: name,
        isPrivate: isPrivate !== "on",
      }
    );

    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Une erreur est survenue",
        messageKey: "common.error",
      };
    }

    return {
      success: true,
      message: "Template sauvegardé avec succès",
      messageKey: "template.save.success",
    };
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");

    return {
      success: false,
      message: "Erreur lors de la sauvegarde du template",
      messageKey: "template.save.error",
    };
  }
}
