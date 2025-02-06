"use server";

export default async function getNotifications() {
  try {
    const res = await fetch(`${process.env.API_URL}/notification`, {
        method: "GET",
        headers: {"Authorization"}
    });
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
  }
}
