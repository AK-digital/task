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
        console.log(profile);
        const user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          cb(null, user);
        } else {
          const createUser = new userModel({
            googleId: profile.id,
            username: profile.name.givenName,
            email: profile._json.email,
          });

          const savedUser = await createUser.save();
          cb(null, savedUser);
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
