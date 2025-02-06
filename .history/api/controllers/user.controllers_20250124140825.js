import cloudinary from "../config/cloudinary.js";
import { userUpdateValidation } from "../helpers/zod.js";
import userModel from "../models/user.model.js";

// Admin only
export async function getUsers(req, res, next) {
  try {
    const users = await userModel.find().select("-password"); // Removing the password from the returned user data

    if (users.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun utilisateur n'a été trouvé dans la base de données",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Utilisateurs trouvés",
      data: users,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Admin only
export async function getUser(req, res, next) {
  try {
    const user = await userModel
      .findById({ _id: req.params.id })
      .select("-password"); // Removing the password from the returned user data

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Aucun utilisateur n'a été trouvé dans la base de données",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Utilisateur trouvé",
      data: user,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateUser(req, res, next) {
  try {
    const { lastName, firstName, picture } = req.body;

    if (!lastName || !firstName) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const validation = userUpdateValidation.safeParse({ lastName, firstName });

    if (!validation.success) {
      const { errors } = validation.error;

      return res.status(400).send({
        success: false,
        message: "Paramètres invalides",
        errors: errors,
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        {
          _id: req.params.id,
        },
        {
          $set: {
            lastName: lastName,
            firstName: firstName,
          },
        },
        {
          setDefaultsOnInsert: true,
          new: true,
        }
      )
      .select("-password"); // Removing the password from the returned user data

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "Impossible de mofidier un utilisateur inexistant",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Utilisateur modifié avec succès",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updatePicture(req, res, next) {
  try {
    const picture = req.file;

    const user = await userModel({ _id: req.params.id });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Impossible de mofidier un utilisateur inexistant",
      });
    }

    const uploadOptions = {
      folder: "task/profil",
      upload_preset: "task_preset",
    };

    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary?.uploader
        ?.upload_stream(uploadOptions, async (err, result) => {
          if (err) return reject(err);
          resolve(result);
        })
        .end(picture?.buffer);
    });

    if (!uploadRes) {
      return res.status(400).send({
        success: false,
        message:
          "Une erreur s'est produite lors de l'enregistrement de la photo de profil sur Cloudinary",
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        {
          _id: req.params.id,
        },
        {
          $set: {
            picture: uploadRes?.secure_url,
          },
        },
        {
          setDefaultsOnInsert: true,
          new: true,
        }
      )
      .select("-password"); // Removing the password from the returned user data

    return res.status(200).send({
      success: true,
      message: "Utilisateur modifié avec succès",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

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

    return res.status(200).send({
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
