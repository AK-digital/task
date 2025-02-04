import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserModel from "../models/User.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_SECRET_ID}`,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
          const newUser = new UserModel({
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
        if (err.code === 11000) {
          return cb(
            new Error("Un utilisateur avec cette adresse email existe déjà."),
            null
          );
        }
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
  UserModel.findById(id)
    .then((user) => {
      return cb(null, user);
    })
    .catch((err) => console.log(err));
});
