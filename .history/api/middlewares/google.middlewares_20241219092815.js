import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_SECRET_ID}`,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const existingUser = await userModel.findOne({
          email: profile._json.email,
        });

        if (existingUser) {
          return cb(
            new Error("Un utilisateur avec cette adresse email existe déjà."),
            null
          );
        }
        if (!user) {
          const newUser = new userModel({
            googleId: profile.id,
            lastName: profile.name.familyName,
            firstName: profile.name.givenName,
            email: profile._json.email,
            picture: profile._json.picture,
          });

          const savedUser = await newUser.save();

          cb(null, savedUser);
        }

        cb(null, user);
      } catch (err) {
        cb(err, null);
      }
    }
  )
);

passport.serializeUser(function (user, cb) {
  console.log("serialize");
  return cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  console.log("deserialize");
  userModel
    .findById(id)
    .then((user) => {
      return cb(null, user);
    })
    .catch((err) => console.log(err));
});
