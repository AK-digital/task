"use server";
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

    const res = await fetch(`${process.env.API_URL}/auth/sign-up`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    });

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
    return {
      status: "failure",
      message: err?.message,
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

    const res = await fetch(`${process.env.API_URL}/auth/sign-in`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    const cookie = await cookies();

    const accessToken = response?.data?.accessToken;
    const refreshToken = response?.data?.refreshToken;

    cookie.set("session", accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      expires: Date.now() + 30 * 60 * 1000, // Expires in 30m
    });

    cookie.set("rtk", refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours en millisecondes
      // Add domain
    });

    return {
      status: "success",
      message: response?.message,
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
          email: "Cette adresse mail n'existe pas",
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
        errors: { email: "Veuillez renseigner votre adresse mail" },
      };
    }

    if (!regex.email.test(email)) {
      return {
        status: "failure",
        errors: { email: "Adresse mail invalide" },
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

    if (res.status === 404) {
      return {
        status: "failure",
        errors: { email: "Aucun utilisateur trouvé ave cette adresse mail" },
      };
    }

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

    if (regex.password.test(newPassword)) {
      return {
        status: "failure",
        errors: {
          newPassword:
            "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre",
        },
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        status: "failure",
        errors: { confirmPassword: "Les mots de passe ne correspondent pas" },
      };
    }

    const res = await fetch(
      `${process.env.API_URL}/auth/reset-forgot-password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetCode, newPassword }),
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }
  } catch (err) {
    return {
      status: "failure",
      message:
        err.message ||
        "Une erreur est survenue lors de la réinitialisation de votre mot de passe",
    };
  }
}
