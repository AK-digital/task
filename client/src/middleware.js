import { NextResponse } from "next/server";
import { handleAuth } from "./middlewares/authMiddleware";
import { getAccessToken } from "./utils/getCookies";

// Le middleware gère l'authentification et l'autorisation
export async function middleware(request) {
  if (request.nextUrl.pathname === "/") {
    const accessToken = await getAccessToken();

    if (accessToken) {
      return NextResponse.redirect(new URL("/projects", request.url));
    }
  } else {
    return await handleAuth(request, NextResponse);
  }
}

export const config = {
  matcher: [
    "/",
    "/projects",
    "/projects/:path*",
    "/profile",
    "/new-project/:path*",
  ], // Routes protégées
};
