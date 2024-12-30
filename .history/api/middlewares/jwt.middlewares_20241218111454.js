export async function auth(req, res, next) {
  try {
    const token = "";

    if (!token) {
      return res
        .status(403)
        .send({ success: false, message: "Accès refusé : Aucun token reçu" });
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function authorize(req, res, next) {}

export async function isAdmin(req, res, next) {}
