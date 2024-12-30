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
        Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
    });

    const response = await res.json();

    console.log(response);

    return response.data;
  } catch (err) {
    console.log(err);
  }
}
