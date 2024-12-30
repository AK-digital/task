import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "./config/db.js";
import passport from "passport";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";

const app = express();
app.use(express.json());

app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use("/api/project", projectRouter);

app.listen(process.env.PORT || 4000, (err) => {
  console.log(process.env.PORT);
  if (err) {
    console.log(err);
  } else {
    console.log(`server is listening on port ${process.env.PORT}`);
  }
});
