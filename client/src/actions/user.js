"use server";
import { userUpdateValidation } from "@/utils/zod";
import { useAuthFetch } from "@/utils/api";

export async function updateUserProfile(formData) {
  try {
    const userId = formData.get("userId");

    const rawData = {
      lastName: formData.get("lastName"),
      firstName: formData.get("firstName"),
      company: formData.get("company"),
      position: formData.get("position"),
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
      message: "Profil mis à jour avec succès",
      data: response.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || "Une erreur est survenue lors de la mise à jour",
    };
  }
}

export async function deleteUserProfile(prevState, formData) {
  return {
    status: "success",
    message: "Bien supprimé",
    data: "Supprimé",
  };
}

export async function updateUserPicture(prevState, formData) {
  try {
    const userId = formData.get("userId");
    const pictureFile = formData.get("picture");

    // Vérifier si un fichier est bien sélectionné
    if (!pictureFile || pictureFile.size === 0) {
      return {
        status: "failure",
        message: "Aucun fichier sélectionné",
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

    console.log("res", res);

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: "Photo de profil mise à jour avec succès",
      data: response.data,
    };
  } catch (err) {
    console.log("err", err);
    return {
      status: "failure",
      message:
        err.message ||
        "Une erreur est survenue lors de la mise à jour de la photo",
    };
  }
}
