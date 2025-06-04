"use server";

export async function confirmBetaRequest(token) {
  try {
    const res = await fetch(`${process.env.API_URL}/beta`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    });

    if (!res.ok) {
      throw new Error(
        "Une erreur est survenue lors de la vérification de votre adresse e-mail"
      );
    }

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la vérification de votre adresse e-mail",
    };
  }
}
