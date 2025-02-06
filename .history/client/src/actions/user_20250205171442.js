"use server";
import { cookies } from "next/headers";
import { userUpdateValidation } from "@/utils/zod";

export async function updateUserProfile(prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie?.get("session");
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

    const res = await fetch(`${process.env.API_URL}/user/${userId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.value}`,
      },
      body: JSON.stringify(rawData),
    });

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

export async function updateUserPicture(prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie?.get("session");
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

    const res = await fetch(`${process.env.API_URL}/user/${userId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session.value}`,
      },
      body: formDataUpload,
    });

    const response = await res.json();

    console.log(response);

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: "Photo de profil mise à jour avec succès",
      data: response.data,
    };
  } catch (err) {
    return {
      status: "failure",
      message:
        err.message ||
        "Une erreur est survenue lors de la mise à jour de la photo",
    };
  }
}

export async function sendResetCode(prevState, formData) {
  try {
    const email = formData.get("email");

    if (!email) {
      return {
        status: "failure",
        errors: ["Veuillez renseigner votre adresse mail"],
        message: "Veuillez renseigner votre adresse mail",
      };
    }

    const res = await fetch(`${process.env.API_URL}/auth/reset-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: "Un code de réinitialisation a été envoyé à votre adresse mail",
    };
  } catch (err) {
    return {
      status: "failure",
      message:
        err.message ||
        "Une erreur est survenue lors de l'envoi du code de réinitialisation",
    };
  }
}
