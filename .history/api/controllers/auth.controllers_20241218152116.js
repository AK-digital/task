import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import { signInValidation, signUpValidation } from "../helpers/zod.js";
import { generateAccessToken, generateRefreshToken } from "../helpers/jwt.js";
import RefreshTokenModel from "../models/RefreshToken.model.js";
import jwt from "jsonwebtoken";
import TokenBlackListModel from "../models/TokenBlackList.model.js";

// Logic for user sign up
export async function signUp(req, res, next) {
  try {
    const { lastName, firstName, email, password } = req.body;

    // Checks if a body value is missing
    if (!lastName || !firstName || !email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres invalides" });
    }

    // Zod validation to check if data are valid
    const validation = signUpValidation.safeParse({
      lastName,
      firstName,
      email,
      password,
    });

    if (!validation.success) {
      const { errors } = validation.error;

      return res.status(400).send({
        success: false,
        message: "Paramètres invalides",
        errors: errors,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hashing user password before saving it

    const user = new UserModel({
      lastName: lastName,
      firstName: firstName,
      email: email,
      password: hashedPassword, // Pass the hashed password
    });

    const savedUser = await user.save(); // Save user in DB

    return res.status(201).send({
      success: true,
      message: "Utilisateur créée avec succès",
      data: savedUser,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Logic for user sign in
export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;

    // Checks if a body value is missing
    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    // Zod validation to check if data are valid.
    const validation = signInValidation.safeParse({ email, password });

    if (!validation.success) {
      const { errors } = validation.error;

      return res.status(400).send({
        success: false,
        message: "Paramètres invalides",
        errors: errors,
      });
    }

    const user = await UserModel.findOne({ email: email }); // Get the user based on the given email

    // Checks if an user is returned.
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Aucun utilisateur correspondant à l'adresse mail saisie",
      });
    }

    // If an user is returned
    const passwordMatch = await bcrypt.compare(password, user?.password);

    // If the password does not match with the returned user then return an error
    if (!passwordMatch) {
      return res.status(404).send({
        success: false,
        message: "Le mot de passe saisi est invalide",
      });
    }

    // Generating access token and passing user info as parameter
    const accessToken = generateAccessToken(user);
    // Generating refresh token and passing user info as parameter
    const refreshToken = generateRefreshToken(user);

    // Deleting the old refresh token in DB if there is one
    await RefreshTokenModel.findOneAndDelete({ userId: user?.id });

    // Then create a new refresh token
    const newRefreshToken = new RefreshTokenModel({
      userId: user?.id,
      refreshToken: refreshToken,
    });

    await newRefreshToken.save(); // Saving it in DB

    return res.status(200).send({
      success: true,
      message: "Utilisateur connecté avec succès",
      data: {
        uid: user?.id,
        role: user?.role,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Refreshing the access token by giving a valid refresh token.
export async function refreshAccessToken(req, res, next) {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const refreshToken = await RefreshTokenModel.findOne({
      refreshToken: token,
    });

    if (!refreshToken) {
      return res.status(404).send({
        success: false,
        message: "Aucun refresh token correspondant au token reçu",
      });
    }

    jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET,
      async function (err, decoded) {
        if (err) {
          if (err.expiredAt) {
            return res.status(403).send({
              success: false,
              message: "Accès refusé : Le token reçu est expiré",
            });
          }
          return res.status(403).send({
            success: false,
            message: "Accès refusé : Le token reçu est invalide",
          });
        } else if (decoded) {
          const user = await UserModel.findById({ _id: decoded?.uid });

          if (!user) {
            return res.status(404).send({
              success: false,
              message: "Aucun utilisateur correspondant à cet ID",
            });
          }

          const newAccessToken = generateAccessToken(user);
          const newRefreshToken = generateRefreshToken(user);

          return res.status(200).send({
            success: true,
            message: "Les tokens ont été rafraîchis avec succès",
            data: {
              uid: user?.id,
              role: user?.role,
              newAccessToken: newAccessToken,
              newRefreshToken: newRefreshToken,
            },
          });
        }
      }
    );
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Logic for user logout by deleting the user refresh token and blacklisting the access token
export async function logout(req, res, next) {
  try {
    // Getting the access token in the header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newTokenBlackListModel = new TokenBlackListModel({
      token: token,
    });

    await newTokenBlackListModel.save();

    return res.status(200).send({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
