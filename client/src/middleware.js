import { NextResponse } from "next/server";
import { handleAuth } from "./middlewares/authMiddleware";
import { getAccessToken } from "./utils/getCookies";

// Le middleware gère l'authentification et l'autorisation
export async function middleware(request) {
  if (request.nextUrl.pathname === "/") {
    const accessToken = await getAccessToken();

    if (accessToken && request.nextUrl.pathname === "/") {
      console.log("Access token found, redirecting to /projects");

      return NextResponse.redirect(new URL("/projects", request.url));
    } else {
      return NextResponse.next();
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
    "/tasks",
    "/tasks/:path*",
    "/profile",
    "/new-project/:path*",
    "/time-trackings",
  ], // Routes protégées
};
