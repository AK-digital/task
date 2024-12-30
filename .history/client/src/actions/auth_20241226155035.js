"use server";

import { signUpSchema } from "@/utils/zod";

export async function signUp(prevState, formData) {
  try {
    console.log(process.env.API_URL);
    const rawFormData = {
      lastName: formData.get("last-name"),
      firstName: formData.get("first-name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validation = signUpSchema.safeParse(rawFormData);

    if (!validation.success) {
      const error = validation.error.errors;

      console.log(error);
      throw new Error();
    }

    const res = await fetch(`${process.env.API_URL}/auth/sign-up`, {
      method: "POST",
      credentials: "include",
      data: JSON.stringify(rawFormData),
    });

    const data = await res.json();

    console.log(data);
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la création d'un nouvel utilisateur"
    );
  }
}
