"use server";
import { useAuthFetch } from "@/utils/api";

export async function saveTemplate(prevState, formData, t) {
  try {
    const projectId = formData.get("project-id");
    const name = formData.get("template-name");

    const res = await useAuthFetch(
      `template?projectId=${projectId}`,
      "POST",
      "application/json",
      {
        projectId: projectId,
        name: name,
      }
    );

    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || t("common.error"),
      };
    }

    return {
      success: true,
      message: t("template.save.success"),
    };
  } catch (err) {
    console.log(err?.message || t("common.error"));

    return {
      success: false,
      message: t("template.save.error"),
    };
  }
}
