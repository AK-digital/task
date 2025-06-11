"use server";
import { useFetch } from "@/utils/api";
import { regex } from "@/utils/regex";
import { signInSchema, signUpSchema } from "@/utils/zod";
import { cookies } from "next/headers";

export async function signUp(t, prevState, formData) {
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
    console.log(err.message || t("auth.signup.error"));
    if (err.message.includes("E11000")) {
      return {
        status: "failure",
        message: t("auth.signup.email_already_used"),
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

export async function signIn(t, prevState, formData) {
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
        message: t("auth.account_not_verified"),
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
    console.log(err.message || t("auth.signin.error"));
    if (err.message.includes("mail")) {
      return {
        status: "failure",
        message: err?.message,
        errors: {
          email: t("auth.validation.email.not_exist"),
        },
      };
    }
    if (err.message.includes("passe")) {
      return {
        status: "failure",
        message: err?.message,
        errors: {
          password: t("auth.validation.credentials.invalid"),
        },
      };
    }
    return {
      status: "failure",
      message: err?.message,
    };
  }
}

export async function sendResetCode(t, prevState, formData) {
  try {
    const email = formData.get("email");

    if (!email) {
      return {
        status: "failure",
        errors: { email: t("auth.validation.email.required") },
      };
    }

    if (!regex.email.test(email)) {
      return {
        status: "failure",
        errors: { email: t("auth.validation.email.invalid") },
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
        errors: { email: t("auth.validation.email.not_found") },
      };
    }

    if (!response.success) {
      throw new Error(response?.message);
    }

    return {
      status: "success",
      message: t("auth.reset_code.sent"),
    };
  } catch (err) {
    return {
      status: "failure",
      message: err.message || t("auth.reset_code.error"),
    };
  }
}

export async function resetForgotPassword(t, prevState, formData) {
  try {
    const resetCode = formData.get("reset-code");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (!newPassword || !confirmPassword) {
      return {
        status: "failure",
        errors: { newPassword: t("auth.validation.password.required") },
      };
    }

    if (!regex.password.test(newPassword)) {
      return {
        status: "failure",
        errors: {
          newPassword: t("auth.validation.password.requirements"),
        },
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        status: "failure",
        errors: { confirmPassword: t("auth.validation.password.no_match") },
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
          newPassword: t("auth.validation.password.must_be_different"),
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
      message: err.message || t("auth.reset_password.error"),
    };
  }
}
