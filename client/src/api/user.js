"use server";
import { cookies } from "next/headers";

export async function getUser(userId) {
    try {
        const cookie = await cookies();
        const session = cookie.get("session");

        const res = await fetch(`${process.env.API_URL}/user/${userId}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.value}`,
            },
        });

        const response = await res.json();

        if (!response.success) {
            throw new Error(response?.message);
        }

        return response.data;
    } catch (err) {
        console.log(
            err.message ||
            "Une erreur est survenue lors de la récupération des données utilisateur"
        );
    }
}