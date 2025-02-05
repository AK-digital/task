"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getProject(id) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/project/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["project"] } }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
      "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function getProjects() {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/project`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["projects"] } }
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response?.message);
    }

    return response.data;
  } catch (err) {
    console.log(
      err.message ||
      "Une erreur est survenue lors de la récupération des projets"
    );
  }
}

export async function deleteProject(projectId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(`${process.env.API_URL}/project/${projectId}`, {
      method: "DELETE",
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

    revalidateTag("projects");
  } catch (err) {
    console.log(
      err.message ||
      "Une erreur est survenue lors de la récupération des tableaux"
    );
  }
}
