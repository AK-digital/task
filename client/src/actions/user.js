"use server";
import { userUpdateValidation } from "@/utils/zod";
import { useAuthFetch } from "@/utils/api";

export async function updateUserProfile(prevState, formData) {
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
      message: "profile.update.success",
      data: response.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || "profile.update.error",
    };
  }
}

export async function updateUserLanguage(userId, language) {
  try {
    if (!userId || !language) {
      throw new Error("profile.language.missing_parameters");
    }

    if (!["fr", "en"].includes(language)) {
      throw new Error("profile.language.not_supported");
    }

    const res = await useAuthFetch(
      `user/${userId}/language`,
      "PATCH",
      "application/json",
      { language }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message || "profile.language.update.error");
    }

    return {
      status: "success",
      message: "profile.language.update.success",
      data: response.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || "profile.language.update.error",
    };
  }
}

export async function updateUserPicture(prevState, formData) {
  try {
    const userId = formData.get("userId");
    const pictureFile = formData.get("picture");

    // Vérifier si un fichier est bien sélectionné
    if (!pictureFile || pictureFile.size === 0) {
      return {
        status: "failure",
        message: "profile.picture.no_file_selected",
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
      message: "profile.picture.update.success",
      data: response.data,
    };
  } catch (err) {
    console.log("err", err);
    return {
      status: "failure",
      message: err.message || "profile.picture.update.error",
    };
  }
}
