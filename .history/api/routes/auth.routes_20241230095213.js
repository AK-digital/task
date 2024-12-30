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

router.get("/session", authMiddlewares.auth, async function (req, res, next) {
  const authUser = res.locals.user;

  return res.status(200).send({
    success: true,
    message: "Utilisateur connecté",
    data: authUser,
  });
});

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
    failureRedirect: `${process.env.CLIENT_URL}/auth`,
    session: false,
  }),
  authControllers.googleSignIn
);

export default router;
