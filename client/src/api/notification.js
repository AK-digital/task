"use server";

import { useAuthFetch } from "@/utils/api";

export async function getNotifications() {
  try {
    const res = await useAuthFetch("notification", "GET");

    const response = await res.json();

    if (!response?.success && res.status !== 404) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
    return {
      success: false,
      message: err?.message || "Une erreur est survenue",
    };
  }
}

export async function readNotification(notificationId) {
  try {
    // Check if the notificationId is missing
    if (!notificationId) {
      throw new Error("Paramètre manquant");
    }

    const res = await useAuthFetch(
      `notification/read/${notificationId}`,
      "PATCH"
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
    return {
      success: false,
      message: err?.message || "Une erreur est survenue",
    };
  }
}

export async function readNotifications(notificationIds) {
  try {
    const isArray = Array.isArray(notificationIds);

    // Check if the notificationIds is an array and if it's empty
    if (!isArray && notificationIds?.length === 0) {
      throw new Error("Paramètre manquants");
    }

    const res = await useAuthFetch(
      "notification/read-all",
      "PATCH",
      "application/json",
      {
        notificationIds,
      }
    );

    const response = await res.json();

    console.log(response, "fril gere");

    if (!response?.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
    return {
      success: false,
      message: err?.message || "Une erreur est survenue",
    };
  }
}
