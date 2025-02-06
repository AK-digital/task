"use server";

export default async function getNotifications() {
  try {
    const res = await fetch(`${process.env.API_URL}/notification`);
  } catch (err) {
    console.log(err?.message || "Une erreur est survenue");
  }
}
