import jwt from "jsonwebtoken";
import userModel from "../models/user.model";
export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(403)
        .send({ success: false, message: "Accès refusé : Aucun token reçu" });
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, function (err, decoded) {
      if (err) {
        console.log(err);
        return res.status(403).send({
          success: false,
          message: "Accès refusé : Le token reçu est invalide",
        });
      } else if (decoded) {
        const user = await userModel.findById({_id: decoded})
        next();
      }
      console.log(decoded);
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function authorize(req, res, next) {}

export async function isAdmin(req, res, next) {}
