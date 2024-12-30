import userModel from "../models/user.model.js";

export async function getUsers(req, res, next) {
  try {
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function getUser(req, res, next) {}

export async function updateUser(req, res, next) {}

// Handle user account deletion in case the user wants to delete his account
export async function deleteUser(req, res, next) {
  try {
    const user = await userModel.findByIdAndDelete({ _id: req.params.id });

    if (!user) {
      return res.status(500).send({
        success: false,
        message: "Impossible de supprimer un utilisateur inexistant",
      });
    }

    return res.status(500).send({
      success: true,
      message: "Utilisateur supprimé avec succès",
      data: user,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
