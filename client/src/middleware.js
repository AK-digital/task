import { NextResponse } from "next/server";
import { handleAuth } from "./middlewares/authMiddleware";

// Le middleware gère l'authentification et l'autorisation
export async function middleware(request) {
  return await handleAuth(request, NextResponse);
}

export const config = {
  matcher: ["/projects", "/projects/:path*", "/profile", "/new-project/:path*"], // Routes protégées
};
