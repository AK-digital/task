"use server";

import { getSession } from "@/api/auth";
import { cookies } from "next/headers";

// Function to perform a fetch request without authentication
export async function useFetch(
  endpoint,
  method = "GET",
  type = "application/json",
  body = null
) {
  // Build the API URL
  const url = `${process.env.API_URL}/${endpoint}`;

  // Request options
  const options = {
    method: method,
    headers: {
      "Content-Type": type,
    },
  };

  // If a body is provided, add it to the options
  if (body !== null) options.body = JSON.stringify(body);

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
  const fetchData = async () => {
    // Get the cookies
    const cookie = await cookies();
    const session = cookie.get("session")?.value;

    // If no session is found, return null
    if (!session) return null;

    // Build the API URL
    const url = `${process.env.API_URL}/${endpoint}`;

    // Request options
    const options = {
      method: method,
      credentials: "include",
      headers: {
        ...(type === "application/json" && { "Content-Type": type }),
        Authorization: `Bearer ${session}`,
      },
    };

    // If a body is provided, add it to the options
    if (type === "multipart/form-data") {
      options.body = body;
    } else if (body !== null) {
      options.body = JSON.stringify(body);
    }

    // Perform the fetch request
    const res = await fetch(
      url,
      options,
      revalidatePath ? { next: { tags: [revalidatePath] } } : undefined
    );

    return res;
  };

  let response = await fetchData();

  // Si on obtient une 401, rafraîchir la session et rejouer la requête
  if (response.status === 401) {
    await getSession(); // Rafraîchir la session
    response = await fetchData(); // Rejouer la requête avec la nouvelle session
  }

  return response;
}
