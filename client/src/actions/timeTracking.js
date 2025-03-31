"use server";
import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";
import "moment/locale/fr";
import moment from "moment";

export async function saveTimeTracking(taskId, projectId, prevState, formData) {
  try {
    const date = formData.get("date");
    const startTime = formData.get("start-time");
    const endTime = formData.get("end-time");

    const startDateTime = moment(`${date}T${startTime}`).format();
    const endDateTime = moment(`${date}T${endTime}`).format();

    const rawData = {
      taskId: taskId,
      startTime: startDateTime,
      endTime: endDateTime,
    };

    const res = await useAuthFetch(
      `time-tracking/?projectId=${projectId}`,
      "POST",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");

    return {
      status: "success",
      message: "Le timer a été enregistré avec succès",
      data: response?.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || "Une erreur est survenue",
    };
  }
}
