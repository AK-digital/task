import { handleDeleteCookies, refreshTokens } from "@/api/auth";
import { getAccessToken, getRefreshToken } from "@/utils/getCookies";

export async function handleAuth(request, NextResponse) {
  try {
    // Récupérer le cookie de session
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    // If the access token cookie does not exist but the refresh token cookie does, refresh the tokens
    if (!accessToken && refreshToken) {
      return await handleTokenRotation(accessToken, request, NextResponse);
    }

    // If the access token cookie does not exist, redirect to the home page
    if (!accessToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If both the access token and refresh token cookies exist, refresh the tokens
    if (accessToken && refreshToken) {
      return await handleTokenRotation(accessToken, request, NextResponse);
    }
  } catch (err) {
    console.log(
      "Une erreur est survenue dans le middleware d'authentification:",
      err.message
    );
    // Delete the cookies and redirect to the home page
    await handleDeleteCookies();
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export async function handleTokenRotation(accessToken, request, NextResponse) {
  let redirect = NextResponse.redirect(request.url);

  // Fetch the session endpoint to check if the access token is still valid
  const res = await fetch(`${process.env.API_URL}/auth/session`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // If the response is unauthorized, refresh the tokens
  if (res.status === 401) {
    const newTokens = await refreshTokens();

    if (!newTokens.success) {
      // Delete the cookies and redirect to the home page
      await handleDeleteCookies();
      return NextResponse.redirect(new URL("/", request.url));
    }

    return redirect;
  }

  // If the response is not OK, delete the cookies and redirect to the home page
  if (!res.ok) {
    // Delete the cookies and redirect to the home page
    await handleDeleteCookies();
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
