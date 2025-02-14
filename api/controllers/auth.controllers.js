import bcrypt from "bcrypt";
import UserModel from "../models/User.model.js";
import { signInValidation, signUpValidation } from "../helpers/zod.js";
import { generateAccessToken, generateRefreshToken } from "../helpers/jwt.js";
import RefreshTokenModel from "../models/RefreshToken.model.js";
import jwt from "jsonwebtoken";
import TokenBlackListModel from "../models/TokenBlackList.model.js";
import { sendEmail } from "../helpers/nodemailer.js";
import { regex } from "../utils/regex.js";
import PasswordResetCodeModel from "../models/PasswordResetCode.model.js";
import { emailResetCode, emailVerification } from "../templates/emails.js";
import crypto from "crypto";
import VerificationModel from "../models/Verification.model.js";

// Logic for user sign up
export async function signUp(req, res, next) {
  try {
    const { lastName, firstName, email, password } = req.body;

    console.log(lastName, firstName, email, password);

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

    const verificationToken = crypto.randomBytes(10).toString("hex");

    const newVerification = new VerificationModel({
      userId: savedUser?._id,
      email: savedUser?.email,
      token: verificationToken,
    });

    const savedVerification = await newVerification.save();

    const link = `${process.env.CLIENT_URL}/verification/${savedVerification?.token}`;
    const template = emailVerification(user, link);

    await sendEmail(
      "task@akdigital.fr",
      savedUser?.email,
      template?.subjet,
      template?.text
    );

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

export async function verificationToken(req, res, next) {
  try {
    if (!req.params.token) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const verification = await VerificationModel.findOne({
      token: req.params.token,
    });

    if (!verification) {
      return res.status(404).send({
        success: false,
        message: "Le token de vérification est expiré ou invalide",
      });
    }

    const user = await UserModel.findById({ _id: verification?.userId });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Aucun utilisateur correspondant à ce token de vérification",
      });
    }

    await UserModel.findByIdAndUpdate(
      { _id: user?._id },
      {
        $set: {
          verified: true,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    await VerificationModel.findOneAndDelete({ token: req.params.token });

    return res.status(200).send({
      success: true,
      message: "Adresse mail vérifiée avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function reSendVerification(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Aucun utilisateur trouvé avec cette adresse mail",
      });
    }

    if (user?.verified) {
      return res.status(403).send({
        success: false,
        message: "Votre adresse mail est déjà vérifiée",
      });
    }

    await VerificationModel.findOneAndDelete({ email: email });

    const verificationToken = crypto.randomBytes(10).toString("hex");

    const newVerification = new VerificationModel({
      userId: user?._id,
      email: user?.email,
      token: verificationToken,
    });

    const savedVerification = await newVerification.save();

    const link = `${process.env.CLIENT_URL}/verification/${savedVerification?.token}`;
    const template = emailVerification(user, link);

    await sendEmail(
      "task@akdigital.fr",
      user?.email,
      template?.subjet,
      template?.text
    );

    return res.status(201).send({
      success: true,
      message: "Email de vérification renvoyé avec succès",
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

    if (user?.verified === false) {
      return res.status(403).send({
        success: false,
        message:
          "Votre adresse mail n'est pas vérifiée, veuillez vérifier votre boîte mail",
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

export async function googleSignIn(req, res, next) {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Deleting the old refresh token in DB if there is one
    await RefreshTokenModel.findOneAndDelete({ userId: user?.id });

    // Then create a new refresh token
    const newRefreshToken = new RefreshTokenModel({
      userId: user?._id,
      refreshToken: refreshToken,
    });

    await newRefreshToken.save(); // Saving it in DB

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Empêche JavaScript d'accéder au cookie
      secure: true, // Utilise HTTPS en production
      sameSite: "strict", // Protection contre les attaques CSRF
      maxAge: 15 * 60 * 1000, // Expiration : 15 minutes
    });

    res.redirect(`${process.env.CLIENT_URL}/auth`);

    // return res.status(200).send({
    //   success: true,
    //   message: "Connexion via Google réussie",
    //   data: {
    //     uid: user._id,
    //     role: user.role,
    //     accessToken: accessToken,
    //     refreshToken: refreshToken,
    //   },
    // });
  } catch (err) {
    console.error("Erreur dans Google callback:", error);
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

          await RefreshTokenModel.findOneAndUpdate(
            {
              refreshToken: token,
            },
            {
              $set: {
                refreshToken: newRefreshToken,
              },
            },
            {
              new: true,
              setDefaultsOnInsert: true,
            }
          );

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

export async function sendResetCode(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    if (!regex.email.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Adresse mail invalide",
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Aucun utilisateur trouvé avec cette adresse mail",
      });
    }

    const resetCode = crypto.randomBytes(10).toString("hex");

    const newPasswordResetCode = await PasswordResetCodeModel({
      userId: user._id,
      resetCode: resetCode,
    });

    const savedPasswordResetCode = await newPasswordResetCode.save();

    const link = `${process.env.CLIENT_URL}/forgot-password/${savedPasswordResetCode?.resetCode}`;
    const template = emailResetCode(user, link);

    await sendEmail(
      "task@akdigital.fr",
      email,
      template?.subjet,
      template.text
    );

    return res.status(201).send({
      success: true,
      message: "Code de réinitialisation envoyé avec succès",
      data: savedPasswordResetCode,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function resetForgotPassword(req, res, next) {
  try {
    const { resetCode, newPassword } = req.body;

    if (!resetCode || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const resetCodeFound = await PasswordResetCodeModel.findOne({
      resetCode: resetCode,
    });

    if (!resetCodeFound) {
      return res.status(404).send({
        success: false,
        message: "Code de réinitialisation invalide",
      });
    }

    const user = await UserModel.findById({ _id: resetCodeFound?.userId });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Aucun utilisateur trouvé avec ce code de réinitialisation",
      });
    }
    console.log(newPassword, user?.password);
    const match = await bcrypt.compare(newPassword, user?.password);

    if (match) {
      return res.status(400).send({
        success: false,
        message: "Le nouveau mot de passe doit être différent de l'ancien",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.findByIdAndUpdate(
      { _id: user?._id },
      {
        $set: {
          password: hashedPassword,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    await PasswordResetCodeModel.findOneAndDelete({ resetCode: resetCode });

    return res.status(200).send({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
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
    const { refreshToken, accessToken } = req.body;

    console.log(accessToken, refreshToken);

    if (!accessToken || !refreshToken) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newTokenBlackListModel = new TokenBlackListModel({
      token: accessToken,
    });

    await newTokenBlackListModel.save();

    await RefreshTokenModel.findOneAndDelete({
      refreshToken: refreshToken,
    });

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
