"use server";

export async function getProjects() {
  try {
    const res = await fetch(`${process.env.API_URL}/project`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.value}`,
      },
    });
  } catch (err) {
    console.log(err);
  }
}
