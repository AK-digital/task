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
  }
}
