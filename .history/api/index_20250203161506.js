import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "./config/db.js";
import cors from "cors";
import passport from "passport";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import boardRouter from "./routes/board.routes.js";
import taskRouter from "./routes/task.routes.js";
import messageRouter from "./routes/message.routes.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json({ limit: "100mb" }));

app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use("/api/project", projectRouter);
app.use("/api/board", boardRouter);
app.use("/api/task", taskRouter);
app.use("/api/message", messageRouter);

const server = app.listen(process.env.PORT || 4000, (err) => {
  console.log(process.env.PORT);
  if (err) {
    console.log(err);
  } else {
    console.log(`server is listening on port ${process.env.PORT}`);
  }
});
