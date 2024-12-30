import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request) {
  const cookie = cookies();

  // Verify if a cookie named session exist
  if (!cookie.get("session")) {
    // If not redirect the user to the auth page
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Else continue if the user is authentified
  return NextResponse.next();
}

export const config = {
  matcher: ["/project", "/project/:path*"], // Protected routes
};
