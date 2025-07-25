"use server";
import { useFetch } from "@/utils/api";
import { regex } from "@/utils/regex";
import { signInSchema, signUpSchema } from "@/utils/zod";
import { cookies } from "next/headers";

export async function signUp(prevState, formData) {
  try {
    const rawFormData = {
      lastName: formData.get("last-name"),
      firstName: formData.get("first-name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validation = signUpSchema.safeParse(rawFormData);

    if (!validation.success) {
      const error = validation.error.flatten().fieldErrors;

      return {
        status: "failure",
        payload: rawFormData,
        message: "",
        errors: error,
      };
    }

    const options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    };

    const res = await useFetch("auth/sign-up", options);

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: response?.message,
    };
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la création d'un nouvel utilisateur"
    );
    if (err.message.includes("E11000")) {
      return {
        status: "failure",
        message: "Cette adresse e-mail est déjà utilisée",
        errors: null,
      };
    }
    return {
      status: "failure",
      message: err?.message,
      errors: null,
    };
  }
}

export async function signIn(prevState, formData) {
  try {
    const rawFormData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validation = signInSchema.safeParse(rawFormData);

    if (!validation.success) {
      const error = validation.error.flatten().fieldErrors;

      return {
        status: "failure",
        payload: rawFormData,
        message: "",
        errors: error,
      };
    }

    const options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    };

    const res = await useFetch("auth/sign-in", options);

    const response = await res.json();

    if (res.status === 403) {
      return {
        status: "failure",
        message: "Votre compte n'est pas encore vérifié.",
        payload: rawFormData,
        errors: null,
      };
    }

    if (!response.success) {
      throw new Error(response?.message);
    }

    const cookie = await cookies();

    const accessToken = response?.data?.accessToken;
    const refreshToken = response?.data?.refreshToken;

    // Pour les deux fonctions, utilisez ce format :
    cookie.set("session", accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h en millisecondes
    });

    cookie.set("rtk", refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationId = cookie.get("invitationId");

    return {
      status: "success",
      message: response?.message,
      invitationId: invitationId ? invitationId?.value : null,
    };
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la création d'un nouvel utilisateur"
    );
    if (err.message.includes("mail")) {
      return {
        status: "failure",
        message: err?.message,
        errors: {
          email: "Cette adresse e-mail n'existe pas",
        },
      };
    }
    if (err.message.includes("passe")) {
      return {
        status: "failure",
        message: err?.message,
        errors: {
          password: "Votre adresse e-mail ou votre mot de passe est invalide",
        },
      };
    }
    return {
      status: "failure",
      message: err?.message,
    };
  }
}

export async function sendResetCode(prevState, formData) {
  try {
    const email = formData.get("email");

    if (!email) {
      return {
        status: "failure",
        errors: { email: "Veuillez renseigner votre adresse e-mail" },
      };
    }

    if (!regex.email.test(email)) {
      return {
        status: "failure",
        errors: { email: "adresse e-mail invalide" },
      };
    }

    const options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    };

    const res = await useFetch("auth/reset-code", options);

    const response = await res.json();

    if (res.status === 404) {
      return {
        status: "failure",
        errors: { email: "Aucun utilisateur trouvé ave cette adresse e-mail" },
      };
    }

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message:
        "Un code de réinitialisation a été envoyé à votre adresse e-mail",
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

export async function resetForgotPassword(prevState, formData) {
  try {
    const resetCode = formData.get("reset-code");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (!newPassword || !confirmPassword) {
      return {
        status: "failure",
        errors: { newPassword: "Veuillez renseigner un nouveau mot de passe" },
      };
    }

    if (!regex.password.test(newPassword)) {
      return {
        status: "failure",
        errors: {
          newPassword:
            "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
        },
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        status: "failure",
        errors: { confirmPassword: "Les mots de passe ne correspondent pas" },
      };
    }

    const options = {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resetCode: resetCode, newPassword: newPassword }),
    };

    const res = await useFetch("auth/reset-forgot-password", options);

    const response = await res.json();

    if (
      !response.success &&
      response?.message ===
        "Le nouveau mot de passe doit être différent de l'ancien"
    ) {
      return {
        status: "failure",
        errors: {
          newPassword:
            "Le nouveau mot de passe doit être différent de l'ancien",
        },
      };
    }

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: response?.message,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "failure",
      message:
        err.message ||
        "Une erreur est survenue lors de la réinitialisation de votre mot de passe",
    };
  }
}
