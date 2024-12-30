"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function handleRedirect(path) {
  redirect(path);
}

export async function getSession() {
  const cookie = await cookies();
  const session = cookie.get("session");
  if (!session) return null;
  return await decryptToken(session);
}

export async function decryptToken(session) {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/session`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session.value}`,
      },
    });

    const response = await res.json();

    if (!response.success) {
      if (
        response.message.includes("expired") ||
        response.message.includes("expiré")
      ) {
        const cookie = await cookies();
        const token = cookie.get("rtk").value;

        if (!token) {
          throw new Error(response?.message);
        }

        return await refreshToken(token);
      } else {
        throw new Error(response?.message);
      }
    }

    console.log(response);
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

    console.log(token, "putain");

    const res = await fetch(`${process.env.API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    });

    const response = await res.json();

    console.log(response);

    if (!response.success) {
      throw new Error(response?.message);
    }

    const cookie = await cookies();
    const newAccessToken = response.data.newAccessToken;
    const newRefreshToken = response.data.newRefreshToken;

    cookie.set("session", newAccessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      expires: Date.now() + 30 * 60 * 1000, // expires in 30m
      // Add domain
    });

    cookie.set("rtk", newRefreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours en millisecondes
      // Add domain
    });

    const newSessionToken = cookie.get("session");

    console.log("tokens refreshed :", response.data);

    return await decryptToken(newSessionToken);
  } catch (err) {
    console.log(err);
    // logout();
    return {
      success: false,
      message:
        err.message ||
        "An unexpected error occurred while refreshing the access token",
    };
  }
}

export async function logout() {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    if (!session) {
      throw new Error("Aucun Access Token reçu");
    }

    console.log(session.value);

    const res = await fetch(`${process.env.API_URL}/auth/logout`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session.value}`,
      },
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    cookie.delete("session");
    cookie.delete("rtk");

    console.log(response);
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la déconnexion d'un utilisateur"
    );
  }
  handleRedirect("/auth");
}
