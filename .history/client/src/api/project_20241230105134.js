"use server";

export async function getProjects() {
  try {
    const res = await fetch(`${process.env.API_URL}/project`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawFormData),
    });
  } catch (err) {
    console.log(err);
  }
}
