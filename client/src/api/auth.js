"use server";
import { useAuthFetch, useFetch } from "@/utils/api";
import { getAccessToken, getRefreshToken } from "@/utils/getCookies";
import { cookies } from "next/headers";

export async function decryptToken() {
  try {
    const res = await useAuthFetch(`auth/session`, "GET", "application/json");

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    console.log("Session decrypted:", response);
    return response;
  } catch (err) {
    console.log("Erreur dans decryptToken:", err.message);
    // logout();
    return {
      success: false,
      message:
        err.message ||
        "An unexpected error occurred while fetching the session",
    };
  }
}

export async function refreshTokens() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("rtk")?.value;

    if (!refreshToken) {
      throw new Error("Refresh token manquant");
    }

    const res = await fetch(`${process.env.API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({ token: refreshToken }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    const newAccessToken = response.data.newAccessToken;
    const newRefreshToken = response.data.newRefreshToken;

    cookieStore.set("session", newAccessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + (12 * 60 + 30) * 60 * 1000), // 12h30 en millisecondes
    });

    cookieStore.set("rtk", newRefreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("Tokens refreshed:", response);

    return response;
  } catch (err) {
    // await handleDeleteCookies();
    console.log("Erreur dans refreshToken:", err.message);
    return {
      success: false,
      message:
        err.message ||
        "Une erreur inattendue s'est produite lors du rafraîchissement du token d'accès",
    };
  }
}

export async function verification(id) {
  try {
    const options = {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await useFetch(`auth/verification/${id}`, options);

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err?.message ||
        "Une erreur inattendue s'est produite lors de la vérification du compte"
    );
    return {
      success: false,
      message:
        err.message ||
        "Une erreur inattendue s'est produite lors de la vérification du compte",
    };
  }
}

export async function reSendVerificationEmail(email) {
  try {
    const options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    };

    const res = await useFetch("auth/verification", options);

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur inattendue s'est produite lors de l'envoi de l'email de vérification"
    );
    return {
      success: false,
      message:
        err.message ||
        "Une erreur inattendue s'est produite lors de la vérification du compte",
    };
  }
}

// C'est l'user qui se déconnecte de lui-même
export async function userLogout() {
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken && !refreshToken) {
      throw new Error("Paramètres manquants");
    }

    const res = await useAuthFetch(
      "auth/logout",
      "DELETE",
      "application/json",
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    await handleDeleteCookies();

    console.log("User logged out:");

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la déconnexion d'un utilisateur"
    );

    return {
      success: false,
      message:
        err.message ||
        "Une erreur est survenue lors de la déconnexion d'un utilisateur",
    };
  }
}

export async function handleDeleteCookies() {
  try {
    const cookieStore = await cookies();

    // Options de base pour les cookies
    const options = {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    };

    cookieStore.delete("session", options);

    cookieStore.delete("rtk", options);

    console.log("Cookies deleted");
  } catch (err) {
    console.log("Erreur dans pendant la suppression des cookies");
  }
}
