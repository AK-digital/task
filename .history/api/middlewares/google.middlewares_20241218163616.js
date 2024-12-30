import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";

console.log(process.env.GOOGLE_SECRET_ID);

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

passport.serializeUser(function (user, done) {
  console.log("serialize");
  return done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log("deserialize");
  userModel
    .findById(id)
    .then((user) => {
      return done(null, user);
    })
    .catch((err) => console.log(err));
});
