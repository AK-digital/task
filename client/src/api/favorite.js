"use server";
import { useAuthFetch } from "@/utils/api";

export async function saveFavorite(projectId) {
  try {
    if (!projectId) {
      return {
        success: false,
        message: "Paramètres manquants",
      };
    }

    const res = await useAuthFetch("favorite", "POST", "application/json", {
      projectId,
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      success: true,
      message: "Favori enregistré avec succès",
      data: response.data,
    };
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de l'enregistrement du favori"
    );

    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de l'enregistrement du favori",
    };
  }
}

export async function getFavorites() {
  try {
    const res = await useAuthFetch("favorite", "GET", "application/json");

    if (res.status === 404) {
      return [];
    }

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des favoris"
    );
    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la récupération des favoris",
    };
  }
}

export async function deleteFavorite(favoriteId) {
  try {
    if (!favoriteId) {
      return {
        success: false,
        message: "Paramètres manquants",
      };
    }

    const res = await useAuthFetch(
      `favorite/${favoriteId}`,
      "DELETE",
      "application/json"
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "Favori non trouvé");
    }

    return {
      success: true,
      message: "Favori supprimé avec succès",
    };
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la suppression du favori"
    );

    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la suppression du favori",
    };
  }
}
