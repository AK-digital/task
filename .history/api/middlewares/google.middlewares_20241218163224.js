import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_ID,
      callbackURL: `=http://localhost:5000/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        console.log("playeds");
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
