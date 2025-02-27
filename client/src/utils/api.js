"use server";

import { getSession } from "@/api/auth";
import { cookies } from "next/headers";

// Function to perform a fetch request without authentication
export async function useFetch(endpoint, method = "GET") {
  // Build the API URL
  const url = `${process.env.API_URL}/${endpoint}`;

  // Request options
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

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
    headers: {
      "Content-Type": type,
      Authorization: `Bearer ${session}`,
    },
  };

  // If a body is provided, add it to the options
  if (body !== null) options.body = JSON.stringify(body);

  // Perform the fetch request
  const res = await fetch(
    url,
    options,
    revalidatePath ?? { next: { tags: [revalidatePath] } }
  );

  // If the response is 401 (unauthorized), get a new session
  if (res.status === 401) {
    await getSession();
  }

  // Return the response
  return res;
}
