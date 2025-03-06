"use server";
import { handleDeleteCookies, logout, refreshToken } from "@/api/auth";
import { getAccessToken, getRefreshToken } from "./getCookies";

// Function to perform a fetch request without authentication
export async function useFetch(endpoint, options = {}) {
  // Build the API URL
  const url = `${process.env.API_URL}/${endpoint}`;

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

  const url = `${process.env.API_URL}/${endpoint}`;

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

  const res = await fetch(
    url,
    options,
    revalidatePath ? { next: { tags: [revalidatePath] } } : undefined
  );

  return res;
}
