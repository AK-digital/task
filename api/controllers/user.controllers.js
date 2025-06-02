import { userUpdateValidation } from "../helpers/zod.js";
import UserModel from "../models/User.model.js";
import { destroyFile, uploadFileBuffer } from "../helpers/cloudinary.js";

// Admin only
export async function getUsers(req, res, next) {
  try {
    const users = await UserModel.find().select("-password");

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
    const user = await UserModel.findById({ _id: req.params.id }).select(
      "-password"
    );

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
    const { lastName, firstName, company, position } = req.body;

    if (!lastName || !firstName) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const validation = userUpdateValidation.safeParse({
      lastName,
      firstName,
      company,
      position,
    });

    if (!validation.success) {
      const { errors } = validation.error;

      return res.status(400).send({
        success: false,
        message: "Paramètres invalides",
        errors: errors,
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          lastName,
          firstName,
          company,
          position,
        },
      },
      {
        setDefaultsOnInsert: true,
        new: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier un utilisateur inexistant",
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

    if (!picture) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier n'a été uploadé",
      });
    }

    const user = await UserModel.findById({ _id: req.params.id });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier un utilisateur inexistant",
      });
    }

    // Si l'utilisateur a déjà une photo, on la supprime de Cloudinary
    if (user?.picture) {
      await destroyFile("profil", user?.picture);
    }

    const uploadRes = await uploadFileBuffer("clynt/profil", picture?.buffer);

    if (!uploadRes) {
      return res.status(400).send({
        success: false,
        message:
          "Une erreur s'est produite lors de l'enregistrement de la photo de sur Cloudinary",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
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
    ).select("-password");

    return res.status(200).send({
      success: true,
      message: "Photo de profil mise à jour avec succès",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await UserModel.findByIdAndDelete({ _id: req.params.id });

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
