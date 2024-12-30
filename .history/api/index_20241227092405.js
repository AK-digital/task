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
import responseRouter from "./routes/response.routes.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000", // Autoriser uniquement ce domaine
  methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP autorisées
  allowedHeaders: ["Content-Type", "Authorization"], // En-têtes autorisés
  credentials: true, // Autoriser l'envoi des cookies avec les requêtes
  optionsSuccessStatus: 204, // Code de statut pour les requêtes OPTIONS réussies
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use("/api/project", projectRouter);
app.use("/api/board", boardRouter);
app.use("/api/task", taskRouter);
app.use("/api/response", responseRouter);

app.listen(process.env.PORT || 4000, (err) => {
  console.log(process.env.PORT);
  if (err) {
    console.log(err);
  } else {
    console.log(`server is listening on port ${process.env.PORT}`);
  }
});
