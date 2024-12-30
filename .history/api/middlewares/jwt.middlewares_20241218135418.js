import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import TokenBlackListModel from "../models/TokenBlackList.model.js";
export async function auth(req, res, next) {
  try {
    // Getting the access token in the header
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(403)
        .send({ success: false, message: "Accès refusé : Aucun token reçu" });
    }

    const isTokenBlackListed = await TokenBlackListModel.findOne({
      refreshToken: token,
    });
    // Using verify method of jwt to ensure that the access token is valid
    jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET,
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
          // Get the user based in the given access token
          const user = await userModel.findById({ _id: decoded?.uid });

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

export async function authorize(req, res, next) {}

export async function isAdmin(req, res, next) {}
