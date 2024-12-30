export function saveProject(req, res, next) {
  try {
    const { author, name } = req.body;

    if (!author || !name) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
