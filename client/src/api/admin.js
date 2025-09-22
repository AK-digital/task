"use client";

export async function getAllUsersForAdmin() {
  try {
    const response = await fetch("/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la récupération des utilisateurs");
    }

    return data;
  } catch (error) {
    console.error("Erreur getAllUsersForAdmin:", error);
    throw error;
  }
}

export async function toggleUserVerification(userId, verified) {
  try {
    const response = await fetch(`/api/admin/users/${userId}/toggle-verification`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ verified }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la modification du statut");
    }

    return data;
  } catch (error) {
    console.error("Erreur toggleUserVerification:", error);
    throw error;
  }
}
