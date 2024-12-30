import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import TokenBlackListModel from "../models/TokenBlackList.model.js";
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
      return res.status(401).send({
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

export async function authorize(req, res, next) {
  const { _id } = res.locals.user;
  const authUserId = _id.toString();
  const uid = req.query.uid || req.params.id;

  console.log(authUserId);
  console.log(uid);

  if (authUserId !== uid) {
    res.status(403).send({
      error: true,
      message:
        "Accès refusé : L'utilisateur n'est pas autorisé à effectuer cette action",
    });
  }

  next();
  // if (!uid) {
  //   res.status(403).send({
  //     error: true,
  //     message:
  //       "Accès refusé : L'utilisateur n'est pas autorisé à effectuer cette action",
  //   });
  // }
}

export async function isAdmin(req, res, next) {}
