"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function saveProject(prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawFormData = {
      name: formData.get("project-name"),
    };

    const res = await fetch(`${process.env.API_URL}/project`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
      },
      body: JSON.stringify(rawFormData),
    });

    const response = await res.json();

    console.log(response);

    revalidateTag("projects");

    return {
      status: "success",
    };
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
  }
}

export async function removeGuest(projectId, prevState, formData) {
  try {
    const res = await fetch(
      `${process.env.API_URL}/project/${projectId}/remove-guest`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawFormData),
      }
    );

    const response = await res.json();

    console.log(response);

    revalidateTag("projects");

    return {
      status: "success",
    };
  } catch (err) {
    console.log(err.message || "Une erreur est survenue");
  }
}
