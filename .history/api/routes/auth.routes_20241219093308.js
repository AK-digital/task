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
  passport.authenticate("google", { failureRedirect: "/login" }, (req, res) => {
    console.log(res);
    const accessToken = generateAccessToken(res);
    const refreshToken = generateRefreshToken(res);
    return res.status(200).send({
      success: true,
      message: "Connexion via Google réussi",
      data: {
        uid: res?._id,
        role: res?.role,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  })
);

export default router;
