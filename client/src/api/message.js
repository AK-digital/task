"use server";
import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";

export async function saveMessage(projectId, taskId, message, taggedUsers) {
  try {
    const rawData = {
      taskId: taskId,
      message: message,
      taggedUsers: taggedUsers,
    };

    const res = await useAuthFetch(
      `message?projectId=${projectId}`,
      "POST",
      "application/json",
      rawData
    );

    const response = await res.json();

    console.log(response);

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de l'enregistrement du message"
    );

    return {
      success: false,
      message: err.message || "Une erreur est survenue",
    };
  }
}

export async function getMessages(projectId, taskId) {
  try {
    const res = await useAuthFetch(
      `message?projectId=${projectId}&taskId=${taskId}`,
      "GET",
      "application/json",
      null,
      "messages"
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la récupération des messages"
    );
  }
}

export async function updateMessage(
  projectId,
  messageId,
  message,
  taggedUsers
) {
  try {
    const rawData = {
      message: message,
      taggedUsers: taggedUsers,
    };

    const res = await useAuthFetch(
      `message/${messageId}?projectId=${projectId}`,
      "PUT",
      "application/json",
      rawData
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de l'enregistrement du message"
    );
  }
}

export async function deleteMessage(projectId, messageId) {
  try {
    const res = await useAuthFetch(
      `message/${messageId}?projectId=${projectId}`,
      "DELETE",
      "application/json"
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la suppression du message"
    );
  }
}
