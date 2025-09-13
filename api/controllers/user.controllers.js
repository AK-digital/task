import { userUpdateValidation } from "../helpers/zod.js";
import UserModel from "../models/User.model.js";
import { destroyFile, uploadFileBuffer } from "../helpers/cloudinary.js";
import EmailChangeModel from "../models/EmailChange.model.js";
import { sendEmail } from "../helpers/nodemailer.js";
import { emailChangeValidation } from "../templates/emails.js";
import crypto from "crypto";

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
    const { lastName, firstName, email, company, position, language } = req.body;

    if (!lastName || !firstName) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const currentUser = await UserModel.findById(req.params.id);
    
    if (!currentUser) {
      return res.status(404).send({
        success: false,
        message: "Utilisateur introuvable",
      });
    }

    // Si l'email est fourni et différent de l'actuel, initier le processus de validation
    if (email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
      // Vérifier si l'email existe déjà
      const existingUser = await UserModel.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        return res.status(400).send({
          success: false,
          message: "Cette adresse email est déjà utilisée",
        });
      }

      // Supprimer toute demande de changement d'email en cours pour cet utilisateur
      await EmailChangeModel.findOneAndDelete({ userId: req.params.id });

      // Créer un token de validation
      const validationToken = crypto.randomBytes(10).toString("hex");

      // Sauvegarder la demande de changement d'email
      const emailChangeRequest = new EmailChangeModel({
        userId: req.params.id,
        token: validationToken,
        oldEmail: currentUser.email,
        newEmail: email.toLowerCase(),
      });

      await emailChangeRequest.save();

      // Envoyer l'email de validation à l'ancienne adresse
      const validationLink = `${process.env.CLIENT_URL}/email-change/${validationToken}`;
      const template = emailChangeValidation(currentUser, email, validationLink);

      await sendEmail(
        "notifications@clynt.io",
        currentUser.email,
        template.subjet,
        template.text
      );

      // Mettre à jour les autres champs (sans l'email)
      const updateData = {
        lastName,
        firstName,
      };

      if (company !== undefined) updateData.company = company;
      if (position !== undefined) updateData.position = position;
      if (language) updateData.language = language;

      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: updateData },
        { setDefaultsOnInsert: true, new: true }
      ).select("-password");

      return res.status(200).send({
        success: true,
        message: "Profil mis à jour. Un email de validation a été envoyé à votre ancienne adresse pour confirmer le changement d'email.",
        data: updatedUser,
        emailChangeRequested: true,
      });
    }

    // Validation des autres champs
    const validation = userUpdateValidation.safeParse({
      lastName,
      firstName,
      email: currentUser.email, // Garder l'email actuel pour la validation
      company,
      position,
      language,
    });

    if (!validation.success) {
      const { errors } = validation.error;

      return res.status(400).send({
        success: false,
        message: "Paramètres invalides",
        errors: errors,
      });
    }

    // Construire l'objet de mise à jour (sans email)
    const updateData = {
      lastName,
      firstName,
    };

    if (company !== undefined) updateData.company = company;
    if (position !== undefined) updateData.position = position;
    if (language) updateData.language = language;

    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: updateData },
      { setDefaultsOnInsert: true, new: true }
    ).select("-password");

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

export async function validateEmailChange(req, res, next) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Token manquant",
      });
    }

    const emailChangeRequest = await EmailChangeModel.findOne({ token });

    if (!emailChangeRequest) {
      return res.status(404).send({
        success: false,
        message: "Token de validation invalide ou expiré",
      });
    }

    // Vérifier que le nouvel email n'est pas déjà utilisé
    const existingUser = await UserModel.findOne({
      email: emailChangeRequest.newEmail,
      _id: { $ne: emailChangeRequest.userId }
    });

    if (existingUser) {
      await EmailChangeModel.findOneAndDelete({ token });
      return res.status(400).send({
        success: false,
        message: "Cette adresse email est déjà utilisée par un autre utilisateur",
      });
    }

    // Mettre à jour l'email de l'utilisateur
    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: emailChangeRequest.userId },
      { $set: { email: emailChangeRequest.newEmail } },
      { new: true, setDefaultsOnInsert: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "Utilisateur introuvable",
      });
    }

    // Supprimer la demande de changement d'email
    await EmailChangeModel.findOneAndDelete({ token });

    return res.status(200).send({
      success: true,
      message: "Adresse email mise à jour avec succès",
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
