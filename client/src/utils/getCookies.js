"use server";
import { cookies } from "next/headers";

export async function getAccessToken() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  return session;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("rtk")?.value;

  if (!refreshToken) return null;

  return refreshToken;
}
