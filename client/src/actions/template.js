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
        message: data.message || "common.error",
        messageKey: "common.error",
      };
    }

    return {
      success: true,
      message: "template.save.success",
      messageKey: "template.save.success",
    };
  } catch (err) {
    console.log(err?.message || "template.save.error");

    return {
      success: false,
      message: "template.save.error",
      messageKey: "template.save.error",
    };
  }
}
