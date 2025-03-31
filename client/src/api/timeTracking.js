"use server";
import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";
import moment from "moment";
export async function getTimeTrackings(queries) {
  try {
    const queryString = queries
      ? `?${new URLSearchParams(queries).toString()}`
      : "";

    const res = await useAuthFetch(
      `time-tracking${queryString}`,
      "GET",
      "application/json",
      null,
      "trackers"
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur est survenue lors de la récupération des timers"
    );
    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la récupération des timers",
    };
  }
}

export async function timeTrackingStart(taskId, projectId) {
  try {
    const startTime = moment.utc().locale("fr").format();

    const rawData = {
      taskId: taskId,
      startTime: startTime,
    };

    const res = await useAuthFetch(
      `time-tracking/start?projectId=${projectId}`,
      "POST",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'enregistrement du timer"
    );
  }
}

export async function timeTrackingStop(taskId, projectId) {
  try {
    const res = await useAuthFetch(
      `time-tracking/stop/${taskId}?projectId=${projectId}`,
      "PATCH",
      "application/json",
      null
    );

    const response = await res.json();

    console.log(response);

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de l'enregistrement du timer"
    );

    return {
      success: false,
      message:
        err?.message ||
        "Une erreur est survenue lors de l'enregistrement du timer",
    };
  }
}

export async function deleteTimeTracking(trackersIds, projectId) {
  try {
    const res = await useAuthFetch(
      `time-tracking?projectId=${projectId}`,
      "DELETE",
      "application/json",
      { trackersIds: trackersIds }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");
    revalidateTag("trackers");

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la suppression du timer"
    );

    return {
      success: false,
      message:
        err?.message ||
        "Une erreur est survenue lors de la suppression de la session",
    };
  }
}
