export async function signUp(prevState, formData) {
  try {
    const res = await fetch(`${process.env.API_URL}`);
  } catch (err) {
    console.log(
      err.message ||
        "Une erreur est survenue lors de la création d'un nouvel utilisateur"
    );
  }
}
