export async function checkProjectRole(req, res, next) {
  try {
    const authUser = res.locals.user;
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
