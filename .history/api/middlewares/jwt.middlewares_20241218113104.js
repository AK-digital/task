import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(403)
        .send({ success: false, message: "Accès refusé : Aucun token reçu" });
    }

    jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET,
      async function (err, decoded) {
        if (err) {
          console.log(err);
          return res.status(403).send({
            success: false,
            message: "Accès refusé : Le token reçu est invalide",
          });
        } else if (decoded) {
          console.log(decoded);
          const user = await userModel.findById({ _id: decoded?.uid });

          if (!user) {
            return res.status(404).send({
              success: false,
              message: "Aucun utilisateur correspondant à cet ID",
            });
          }

          res.locals.user = user;
          //   next();
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
