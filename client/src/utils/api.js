"use server";
import { getAccessToken } from "./getCookies";

// Function to perform a fetch request without authentication
export async function useFetch(endpoint, options = {}) {
  // Build the API URL - nettoyer pour éviter les doubles barres obliques
  const baseUrl = process.env.API_URL?.replace(/\/$/, '') || '';
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = `${baseUrl}/${cleanEndpoint}`;

  // Perform the fetch request
  const res = await fetch(url, options);

  // Return the response
  return res;
}

// Function to perform a fetch request with authentication
export async function useAuthFetch(
  endpoint,
  method,
  type = "application/json",
  body = null,
  revalidatePath
) {
  // Fonction interne pour effectuer la requête
  const accessToken = await getAccessToken();

  // Build the API URL - nettoyer pour éviter les doubles barres obliques
  const baseUrl = process.env.API_URL?.replace(/\/$/, '') || '';
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = `${baseUrl}/${cleanEndpoint}`;

  const options = {
    method: method,
    credentials: "include",
    headers: {
      ...(type === "application/json" && { "Content-Type": type }),
      Authorization: `Bearer ${accessToken}`,
    },
  };

  if (type === "multipart/form-data") {
    options.body = body;
  } else if (body !== null) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(
      url,
      options,
      revalidatePath ? { next: { tags: [revalidatePath] } } : undefined
    );

    return res;
  } catch (error) {
    console.error("Erreur lors de la requête fetch:", error);
    throw error;
  }
}
