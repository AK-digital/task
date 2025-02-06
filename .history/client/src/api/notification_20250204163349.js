"use server";

import { cookies } from "next/headers";

export default async function getNotifications() {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(`${process.env.API_URL}/notification`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
      },
    });

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message);
    }

    return response;
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
  }
}
