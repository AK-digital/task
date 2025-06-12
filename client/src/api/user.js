"use server";
import { useAuthFetch } from "@/utils/api";

export async function getUser(userId) {
  try {
    const res = await useAuthFetch(`user/${userId}`, "GET", "application/json");

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des données utilisateur"
    );
  }
}

export async function updateUserLanguage(userId, language) {
  try {
    const res = await useAuthFetch(
      `user/${userId}/language`,
      "PATCH",
      "application/json",
      { language }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.error(
      err.message ||
        "Une erreur est survenue lors de la mise à jour de la langue"
    );
    throw err;
  }
}
