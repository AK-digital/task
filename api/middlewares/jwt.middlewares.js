import jwt from "jsonwebtoken";
import UserModel from "../models/User.model.js";
import TokenBlackListModel from "../models/TokenBlackList.model.js";
import ProjectInvitationModel from "../models/ProjectInvitation.model.js";
export async function auth(req, res, next) {
  try {
    // Getting the access token in the header
    const token = req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "Accès refusé : Aucun token reçu" });
    }

    // Check in the black list collection if an entry exist with the given token
    const isTokenBlackListed = await TokenBlackListModel.findOne({
      token: token,
    });

    // If yes that means that the given token is black listed then return a 403 error
    if (isTokenBlackListed) {
      return res.status(403).send({
        success: false,
        message: "Accès refusé : Le token reçu est dans la liste noire",
      });
    }

    // Using verify method of jwt to ensure that the access token is valid
    jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET,
      async function (err, decoded) {
        if (err) {
          if (err.expiredAt) {
            return res.status(401).send({
              success: false,
              message: "Accès refusé : Le token reçu est expiré",
            });
          }
          return res.status(401).send({
            success: false,
            message: "Accès refusé : Le token reçu est invalide",
          });
        } else if (decoded) {
          // Get the user based in the given access token
          const user = await UserModel.findById({ _id: decoded?.uid }).select(
            "-password"
          );

          if (!user) {
            return res.status(404).send({
              success: false,
              message: "Aucun utilisateur correspondant à cet ID",
            });
          }

          // Setting the user in locals so we fetch the user in the controllers without calling the DB again
          res.locals.user = user;

          console.log(
            "---------- " + user.email + " est connecté" + "----------"
          );

          // Pass to the controller
          next();
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

export async function authorize(req, res, next) {
  try {
    const { privilege, _id } = res.locals.user;
    const authUserId = _id.toString();
    const uid = req.query.userId || req.params.id;

    // If user role is not an admin we verify if he can perform the action
    if (privilege === "user") {
      if (!uid) {
        return res
          .status(400)
          .send({ success: false, message: "Paramètres manquants" });
      }
      // Checks that the auth user id and the uid in query/params are the same to make sure that they are the same user
      if (authUserId !== uid) {
        return res.status(403).send({
          success: false,
          message:
            "Accès refusé : L'utilisateur n'est pas autorisé à effectuer cette action",
        });
      }

      next();
      // If user role is admin he can perform the action without any verification
    } else if (privilege === "admin") {
      next();
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Only checks if the user who make the request is an admin
export async function isAdmin(req, res, next) {
  try {
    const { privilege } = res.locals.user;

    if (privilege !== "admin") {
      return res.status(403).send({
        success: false,
        message:
          "Accès refusé : L'utilisateur n'est pas autorisé à effectuer cette action",
      });
    }

    next();
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

// Checks if has an account for project accept invitation
export async function hasAccount(req, res, next) {
  try {
    const { invitationId } = req.body;

    const projectInvitation = await ProjectInvitationModel.findById({
      _id: invitationId,
    });

    if (!projectInvitation) {
      return res.status(404).send({
        success: false,
        message: "Impossible d'accepter une invitation qui n'existe pas",
      });
    }

    const user = await UserModel.findOne({
      email: projectInvitation?.guestEmail,
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "L'utilisateur n'existe pas",
      });
    }

    next();
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
