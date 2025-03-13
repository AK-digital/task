"use server";

import { useAuthFetch } from "@/utils/api";

export default async function getNotifications() {
  try {
    const res = await useAuthFetch("notification", "GET");

    const response = await res.json();

    if (!response?.success && res.status !== 404) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
    return { success: false, message: err?.message || "Une erreur est survenue" };
  }
}

export async function markAsRead(notificationId) {
  try {
    const res = await useAuthFetch(`notification/${notificationId}/read`, "PUT");
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.message || "Échec de la mise à jour de la notification");
    }
    
    const response = await res.json();
    return response;
  } catch (err) {
    console.error(err?.message || "Une erreur est survenue lors du marquage de la notification");
    return { success: false, message: err?.message || "Une erreur est survenue" };
  }
}

export async function markAllAsRead() {
  try {
    const res = await useAuthFetch("notification/read-all", "PUT");
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.message || "Échec de la mise à jour des notifications");
    }
    
    const response = await res.json();
    return response;
  } catch (err) {
    console.error(err?.message || "Une erreur est survenue lors du marquage des notifications");
    return { success: false, message: err?.message || "Une erreur est survenue" };
  }
}
