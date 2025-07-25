"use server";

import { useAuthFetch } from "@/utils/api";
import { revalidateTag } from "next/cache";

/**
 * Fetches templates using authenticated request
 * @async
 * @returns {Promise<{success: boolean, message: string, data: Array}>} Response object containing:
 *  - success: boolean indicating if request was successful
 *  - message: status message
 *  - data: array of templates if successful, empty array if not
 * @throws {Error} If request fails or returns error
 *
 * useAuthFetch parameters:
 * @param {'template'} endpoint - API endpoint to fetch templates
 * @param {'GET'} method - HTTP method used
 * @param {'application/json'} contentType - Request content type header
 * @param {null} body - Request body (null for GET requests)
 * @param {'templates'} cache - Cache key for the request
 */

export async function saveBoardTemplate(boardId, projectId) {
  try {
    const res = await useAuthFetch(
      `template/board?projectId=${projectId}`,
      "POST",
      "application/json",
      { boardId: boardId }
    );

    const data = await res.json();

    if (!data?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    revalidateTag("projects");

    return data;
  } catch (err) {
    console.log(err?.message || "Une erreur s'est produite");
  }
}

export async function getPublicTemplates() {
  try {
    const res = await useAuthFetch(
      `template`,
      "GET",
      "application/json",
      null,
      "templates"
    );

    const data = await res.json();

    if (res.status === 404) {
      return {
        success: false,
        message: "Aucun modèle trouvé",
        data: [],
      };
    }

    if (!data?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    return data;
  } catch (err) {
    console.log(err.message || "Une erreur s'est produite");
  }
}

export async function getUserPrivateTemplates() {
  try {
    const res = await useAuthFetch(
      `template/user-private`,
      "GET",
      "application/json",
      null,
      "templates"
    );

    const data = await res.json();

    if (res.status === 404) {
      return {
        success: false,
        message: "Aucun modèle trouvé",
        data: [],
      };
    }

    if (!data?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    return data;
  } catch (err) {
    console.log(err.message || "Une erreur s'est produite");
  }
}

export async function useTemplate(templateId) {
  try {
    const res = await useAuthFetch(
      `template/use/project/${templateId}`,
      "POST",
      "application/json"
    );

    const data = await res.json();

    if (!data?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    revalidateTag("projects");

    return data;
  } catch (err) {
    console.log(err.message || "Une erreur s'est produite");
  }
}

export async function useCustomTemplate(projectName, boards) {
  try {
    const res = await useAuthFetch(
      "template/use/custom",
      "POST",
      "application/json",
      { projectName, boards }
    );

    const data = await res.json();

    if (!data?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    revalidateTag("projects");

    return data;
  } catch (err) {
    console.log(err.message || "Une erreur s'est produite");
    throw err;
  }
}

export async function deleteTemplate(templateId) {
  try {
    const res = await useAuthFetch(
      `template/${templateId}`,
      "DELETE",
      "application/json"
    );

    const data = await res.json();

    if (!data?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    revalidateTag("templates");

    return data;
  } catch (err) {
    console.log(err.message || "Une erreur s'est produite");
  }
}

export async function updateTemplateVisibility(templateId) {
  try {
    const res = await useAuthFetch(
      `template/private/${templateId}`,
      "PATCH",
      "application/json"
    );

    const data = await res.json();

    if (!data?.success) {
      throw new Error(data?.message || "Une erreur s'est produite");
    }

    revalidateTag("templates");

    return data;
  } catch (err) {
    console.log(err.message || "Une erreur s'est produite");
  }
}