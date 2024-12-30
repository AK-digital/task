import passport from "passport";
import { GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";

new GoogleStrategy({
  c,
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_ID,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        console.log("played");
        console.log(profile);
        const user = userModel.find({ googleId: profile.id });

        if (!user) {
          //   const newUser = new userModel({
          //     lastName: profile,
          //   });
        } else {
          cb(null, user);
        }
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
