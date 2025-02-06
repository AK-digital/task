"use server";
import { cookies } from "next/headers";

export async function saveMessage(projectId, taskId, message, taggedUsers) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawData = {
      taskId: taskId,
      message: message,
      taggedUsers: taggedUsers,
    };

    const res = await fetch(
      `${process.env.API_URL}/message/description?projectId=${projectId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
        body: JSON.stringify(rawData),
      }
    );

    const response = await res.json();

    console.log(response);

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    revalidateTag("tasks");

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de l'enregistrement du message"
    );
  }
}
