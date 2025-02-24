"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function handleRedirect(path) {
  redirect(path);
}

export async function getSession() {
  const cookie = await cookies();
  const session = cookie.get("session");
  return await decryptToken(session);
}

export async function decryptToken(session) {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/session`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session?.value}`,
      },
    });

    const response = await res.json();

    if (!response.success) {
      if (
        response.message.includes("expired") ||
        response.message.includes("expiré")
      ) {
        const cookie = await cookies();
        const token = cookie.get("rtk")?.value;

        if (!token) {
          throw new Error(response?.message);
        }

        return await refreshToken(token);
      } else {
        throw new Error(response?.message);
      }
    }

    return response;
  } catch (err) {
    console.log(err);
    // logout();
    return {
      success: false,
      message:
        err.message ||
        "An unexpected error occurred while fetching the session",
    };
  }
}

export async function refreshToken(token) {
  try {
    const rawFormData = {
      token: token,
    };

    const res = await fetch(`${process.env.API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    });

    const response = await res.json();

    if (!response.success) {
      console.error(
        "Erreur lors du rafraîchissement du token:",
        response?.message
      );
      throw new Error(response?.message);
    }

    const cookie = await cookies();
    const newAccessToken = response.data.newAccessToken;
    const newRefreshToken = response.data.newRefreshToken;

    cookie.set("session", newAccessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 30 * 60 * 1000),
    });

    cookie.set("rtk", newRefreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const newSessionToken = cookie.get("session");

    console.log("Tokens refreshed:", response);

    return await decryptToken(newSessionToken);
  } catch (err) {
    console.error("Erreur dans refreshToken:", err.message);
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
    const res = await fetch(`${process.env.API_URL}/auth/verification/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    const res = await fetch(`${process.env.API_URL}/auth/verification`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

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

export async function logout() {
  try {
    const cookie = await cookies();
    const refreshToken = cookie.get("rtk");
    const accessToken = cookie.get("session");

    if (!accessToken || !refreshToken) {
      throw new Error("Paramètres manquants");
    }

    const res = await fetch(`${process.env.API_URL}/auth/logout`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken?.value}`,
      },
      body: JSON.stringify({
        accessToken: accessToken?.value,
        refreshToken: refreshToken?.value,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    // Options de base pour les cookies
    const cookieOptions = {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    };

    // Double vérification avec delete
    cookie.delete("session", cookieOptions);
    cookie.delete("rtk", cookieOptions);

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
