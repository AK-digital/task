"use server";

export async function saveBoard(projectId) {
  try {
    const rawFormData = {
      title: "Nouveau tableau",
    };
    const res = await fetch(
      `${process.env.API_URL}/board?projectId=${projectId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.value}`, // Pass the Access Token to authenticate the request
        },
      }
    );
  } catch (err) {
    console.log(
      err.message || "Une erreur est survenue lors de la création du tableau"
    );
  }
}
