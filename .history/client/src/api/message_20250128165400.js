"use server";
import { cookies } from "next/headers";

export async function getMessages(projectId, taskId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const res = await fetch(
      `${process.env.API_URL}/message?projectId=${projectId}&taskId=${taskId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
      },
      { next: { tags: ["messages"] } }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }
    console.log(response);
    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des messages"
    );
  }
}

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
      `${process.env.API_URL}/message?projectId=${projectId}`,
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

    revalidateTag("messages");

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de l'enregistrement du message"
    );
  }
}

export async function deleteMessage(projectId, taskId) {
  try {
    const cookie = await cookies();
    const session = cookie.get("session");

    const rawData = {
      taskId: taskId,
      message: message,
      taggedUsers: taggedUsers,
    };

    const res = await fetch(
      `${process.env.API_URL}/message/${taskId}?projectId=${projectId}`,
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

    revalidateTag("messages");

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de l'enregistrement du message"
    );
  }
}
