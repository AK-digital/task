"use server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Récupérer les cookies avec next/headers (App Router)

    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Aucun refresh token trouvé" },
        { status: 401 }
      );
    }

    // Appel à ton API backend pour rafraîchir le token
    const res = await fetch(`${process.env.API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    const response = await res.json();

    const newAccessToken = response?.data?.newAccessToken;
    const newRefreshToken = response?.data?.newRefreshToken;

    if (!response.success) {
      throw new Error(
        response?.message || "Échec du rafraîchissement du token"
      );
    }

    // ✅ Créer une réponse avec Set-Cookie
    const nextResponse = NextResponse.json({ success: true });

    nextResponse.headers.set(
      "Set-Cookie",
      `session=${newAccessToken}; HttpOnly; Path=/; SameSite=Lax`
    );

    nextResponse.headers.append(
      "Set-Cookie",
      `rtk=${newRefreshToken}; HttpOnly; Path=/; SameSite=Lax`
    );

    return nextResponse;
  } catch (err) {
    console.error("Erreur lors du refreshToken:", err.message);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Une erreur inattendue s'est produite lors du rafraîchissement du token d'accès",
      },
      { status: 500 }
    );
  }
}
