"use server";
import { cookies } from "next/headers";

export async function getProjects() {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(`${process.env.API_URL}/project`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.value}`,
      },
    });

    const response = await res.json();
  } catch (err) {
    console.log(err);
  }
}
