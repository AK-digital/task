import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_ID,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const user = userModel.find({ googleId: profile.id });

        if (!user) {
        } else {
          done(null, user);
        }
      } catch (err) {}
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
