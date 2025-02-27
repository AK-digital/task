"use server";
import { useAuthFetch } from "@/utils/api";

export async function saveTemplate(prevState, formData) {
  try {
    const projectId = formData.get("project-id");
    const name = formData.get("template-name");

    const rawData = {
      projectId: projectId,
      name: name,
    };

    const res = await useAuthFetch(
      "template",
      "POST",
      "application/json",
      rawData
    );

    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Une erreur s'est produite",
      };
    }

    console.log(data);

    return {
      success: true,
      message: "Le template a été enregistré avec succès",
    };
  } catch (err) {
    console.log(err?.message || "Une erreur s'est produite");

    return {
      success: false,
      message: "Une erreur s'est produite lors de l'enregistrement du template",
    };
  }
}
