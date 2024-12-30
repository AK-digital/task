"use server";

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

    cookie.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
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
          password: err?.message,
        },
      };
    }
    return {
      status: "failure",
      message: err?.message,
    };
  }
}
