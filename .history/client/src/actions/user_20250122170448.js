import { cookies } from "next/headers";

export async function updateUserPicture(userId, prevState, formData) {
  try {
    const cookie = await cookies();
    const session = cookie?.get("session");

    const picture = formData?.get("picture");

    const rawData = {
      picture: picture,
    };

    const res = await fetch(`${process.env.API_URL}/user/${userId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
      },
      body: JSON.stringify(rawData), // Utilisez l'objet FormData comme body
    });
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors du changement de la photo de profil"
    );
  }
}
