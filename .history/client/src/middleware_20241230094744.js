import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request) {
  const cookie = cookies();

  // Vérifier si le cookie "session" existe
  if (!cookie.get("session")) {
    // Rediriger vers la page /auth si non connecté
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Continuer si l'utilisateur est connecté
  return NextResponse.next();
}

export const config = {
  matcher: ["/project", "/project/:path*"], // Liste des routes protégées
};
