export async function checkProjectRole(req, res, next) {
  try {
    const authUser = res.locals.user;

    const projectId = req.query.projectId || req.params.id;
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
