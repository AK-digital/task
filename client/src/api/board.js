"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function getBoards(projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/board?projectId=${projectId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["boards"] } }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}

export async function revalidateBoards() {
  console.log("revalidate played");
  revalidateTag("projects");
  revalidateTag("boards");
}
