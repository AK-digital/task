"use server";
import { useAuthFetch } from "@/utils/api";
import { isNotEmpty } from "@/utils/utils";

export async function saveMessage(
  projectId,
  taskId,
  message,
  taggedUsers,
  attachments,
  subtaskId = null
) {
  try {
    const data = new FormData();
    if (subtaskId) {
      data.append("subtaskId", subtaskId);
    } else {
      data.append("taskId", taskId);
    }
    data.append("message", message);

    data.append("taggedUsers", JSON.stringify(taggedUsers));

    if (isNotEmpty(attachments)) {
      attachments.forEach((file) => {
        data.append("attachments", file);
      });
    }

    const res = await useAuthFetch(
      `message?projectId=${projectId}`,
      "POST",
      "multipart/form-data",
      data
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

    return {
      success: false,
      message: err.message || "Une erreur est survenue",
    };
  }
}

export async function getMessages(projectId, taskId, subtaskId = null) {
  try {
    const queryParams = new URLSearchParams({
      projectId: projectId,
      ...(subtaskId ? { subtaskId } : { taskId })
    });
    
    const res = await useAuthFetch(
      `message?${queryParams.toString()}`,
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
  taggedUsers,
  attachments
) {
  try {
    const data = new FormData();
    data.append("message", message);

    data.append("taggedUsers", JSON.stringify(taggedUsers));

    if (isNotEmpty(attachments)) {
      attachments.forEach((attachment) => {
        if (attachment instanceof File) {
          data.append("attachments", attachment);
        } else {
          data.append(
            "existingFiles",
            JSON.stringify({
              id: attachment.id,
              name: attachment.name,
              url: attachment.url,
            })
          );
        }
      });
    }

    const res = await useAuthFetch(
      `message/${messageId}?projectId=${projectId}`,
      "PUT",
      "multipart/form-data",
      data
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

export async function updateReadBy(projectId, messageId) {
  try {
    const res = await useAuthFetch(
      `message/${messageId}/read?projectId=${projectId}`,
      "PATCH",
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
    return {
      success: false,
      message: err.message || "Une erreur est survenue",
    };
  }
}

export async function updateReactions(projectId, messageId, emoji) {
  try {
    const res = await useAuthFetch(
      `message/${messageId}/reaction?projectId=${projectId}`,
      "PATCH",
      "application/json",
      { emoji: emoji }
    );

    const response = await res.json();

    if (!response?.success) {
      throw new Error(response?.message || "Une erreur est survenue");
    }

    return response;
  } catch (error) {
    console.log(
      error.message ||
        "Une erreur est survenue lors de la mise à jour de la réaction"
    );
    return {
      success: false,
      message: error.message || "Une erreur est survenue",
    };
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

    return {
      success: false,
      message: err.message || "Une erreur est survenue",
    };
  }
}
