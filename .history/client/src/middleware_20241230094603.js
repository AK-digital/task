import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const cookie = await cookies();
  if (!cookie.get("session")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/protected-route/:path*", "/dashboard/:path*"], // Liste des routes protégées
};
