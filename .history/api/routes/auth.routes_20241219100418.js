import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as authControllers from "../controllers/auth.controllers.js";
import passport from "passport";
import "../middlewares/google.middlewares.js";

router.post("/sign-up", authControllers.signUp);
router.post("/sign-in", authControllers.signIn);
router.post("/refresh-access-token", authControllers.refreshAccessToken);
router.delete("/logout", authMiddlewares.auth, authControllers.logout);

// Google auth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  authControllers.googleSignIn
);

export default router;
