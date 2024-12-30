import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as authControllers from "../controllers/auth.controllers.js";
import passport from "passport";
import "../middlewares/google.middlewares.js";
import { generateAccessToken, generateRefreshToken } from "../helpers/jwt.js";

router.post("/sign-up", authControllers.signUp);
router.post("/sign-in", authControllers.signIn);
router.post("/refresh-access-token", authControllers.refreshAccessToken);
router.post("/logout", authMiddlewares.auth, authControllers.logout);

// Google auth

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    try {
      // L'utilisateur est disponible dans req.user après une authentification réussie
      const user = req.user;

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return res.status(200).send({
        success: true,
        message: "Connexion via Google réussie",
        data: {
          uid: user._id,
          role: user.role,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      });
    } catch (error) {
      console.error("Erreur dans Google callback:", error);
      return res.status(500).send({
        success: false,
        message: "Une erreur est survenue",
      });
    }
  }
);

export default router;
