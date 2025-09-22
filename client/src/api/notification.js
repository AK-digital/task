"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Fonction pour obtenir le token depuis les cookies
function getCookieValue(name) {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export async function getNotifications() {
  try {
    const token = getCookieValue('session');
    
    if (!token) {
      throw new Error("Token d'authentification non trouvé");
    }

    const res = await fetch(`${API_URL}/notification`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    const response = await res.json();

    if (!response?.success && res.status !== 404) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
    return {
      success: false,
      message: err?.message || "Une erreur est survenue",
    };
  }
}

export async function readNotification(notificationId) {
  try {
    // Check if the notificationId is missing
    if (!notificationId) {
      throw new Error("Paramètre manquant");
    }

    const token = getCookieValue('session');
    
    if (!token) {
      throw new Error("Token d'authentification non trouvé");
    }

    const res = await fetch(`${API_URL}/notification/read/${notificationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
    return {
      success: false,
      message: err?.message || "Une erreur est survenue",
    };
  }
}

export async function readNotifications(notificationIds) {
  try {
    const isArray = Array.isArray(notificationIds);

    // Check if the notificationIds is an array and if it's empty
    if (!isArray && notificationIds?.length === 0) {
      throw new Error("Paramètre manquants");
    }

    const token = getCookieValue('session');
    
    if (!token) {
      throw new Error("Token d'authentification non trouvé");
    }

    const res = await fetch(`${API_URL}/notification/read-all`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        notificationIds,
      }),
    });

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
    return {
      success: false,
      message: err?.message || "Une erreur est survenue",
    };
  }
}
