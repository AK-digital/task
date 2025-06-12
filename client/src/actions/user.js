"use server";
import { userUpdateValidation } from "@/utils/zod";
import { useAuthFetch } from "@/utils/api";

export async function updateUserProfile(t, prevState, formData) {
  try {
    const userId = formData.get("userId");

    const rawData = {
      lastName: formData.get("lastName"),
      firstName: formData.get("firstName"),
      company: formData.get("company"),
      position: formData.get("position"),
      language: formData.get("language"),
    };

    // Validation Zod
    const validation = userUpdateValidation.safeParse(rawData);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return {
        status: "failure",
        errors: errors,
      };
    }

    const res = await useAuthFetch(
      `user/${userId}`,
      "PUT",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: t("profile.update.success"),
      data: response.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || t("profile.update.error"),
    };
  }
}

export async function updateUserLanguage(userId, language) {
  try {
    if (!userId || !language) {
      throw new Error("Paramètres manquants");
    }

    if (!["fr", "en"].includes(language)) {
      throw new Error("Langue non supportée");
    }

    const res = await useAuthFetch(
      `user/${userId}/language`,
      "PATCH",
      "application/json",
      { language }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(
        response?.message || "Erreur lors de la mise à jour de la langue"
      );
    }

    return {
      status: "success",
      message: "Langue mise à jour avec succès",
      data: response.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message:
        err.message ||
        "Une erreur est survenue lors de la mise à jour de la langue",
    };
  }
}

export async function updateUserPicture(t, prevState, formData) {
  try {
    const userId = formData.get("userId");
    const pictureFile = formData.get("picture");

    // Vérifier si un fichier est bien sélectionné
    if (!pictureFile || pictureFile.size === 0) {
      return {
        status: "failure",
        message: t("profile.picture.no_file_selected"),
      };
    }

    // Créer un FormData pour l'envoi multipart
    const formDataUpload = new FormData();
    formDataUpload.append("picture", pictureFile);

    const res = await useAuthFetch(
      `user/${userId}/picture`,
      "PATCH",
      "multipart/form-data",
      formDataUpload
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: t("profile.picture.update.success"),
      data: response.data,
    };
  } catch (err) {
    console.log("err", err);
    return {
      status: "failure",
      message: err.message || t("profile.picture.update.error"),
    };
  }
}
