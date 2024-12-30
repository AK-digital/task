export async function auth(req, res, next) {
  const token = "";

  if (!token) {
    return res
      .status(403)
      .send({ success: false, message: "Accès refusé : Aucun token reçu" });
  }
}

export async function authorize(req, res, next) {}

export async function isAdmin(req, res, next) {}
