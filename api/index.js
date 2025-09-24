import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "./config/db.js";
import cors from "cors";
import passport from "passport";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import templateRouter from "./routes/template.routes.js";
import boardTemplateRouter from "./routes/boardTemplate.routes.js";
import projectRouter from "./routes/project.routes.js";
import projectInvitations from "./routes/projectInvitation.routes.js";
import statusRouter from "./routes/status.routes.js";
import priorityRouter from "./routes/priority.routes.js";
import boardRouter from "./routes/board.routes.js";
import taskRouter from "./routes/task.routes.js";
import subtaskRouter from "./routes/subtask.routes.js";
import messageRouter from "./routes/message.routes.js";
import draftRouter from "./routes/draft.routes.js";
import timeTrackingRouter from "./routes/timeTracking.routes.js";
import favoriteRouter from "./routes/favorite.routes.js";
import betaRouter from "./routes/beta.routes.js";
import socketHandler from "./utils/socket.js";
import aiRouter from "./routes/ai.routes.js";
import feedbackRouter from "./routes/feedback.routes.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  addTrailingSlash: false,
  transports: ["websocket", "polling"],
  cors: {
    origin: [process.env.CLIENT_URL, process.env.LANDING_URL],
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const corsOptions = {
  origin: [
    process.env.CLIENT_URL, 
    process.env.LANDING_URL,
    "http://localhost:3000", // Ajout explicite pour le développement local
    "http://127.0.0.1:3000"
  ].filter(Boolean), // Filtrer les valeurs undefined
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200 // Pour les anciens navigateurs
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json({ limit: "100mb" }));

app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/notification", notificationRouter);

app.use("/api/template", templateRouter);
app.use("/api/board-template", boardTemplateRouter);

app.use("/api/project", projectRouter);
app.use("/api/project-invitation", projectInvitations);
app.use("/api/status", statusRouter);
app.use("/api/priority", priorityRouter);
app.use("/api/board", boardRouter);
app.use("/api/task", taskRouter);
app.use("/api/subtask", subtaskRouter);
app.use("/api/message", messageRouter);
app.use("/api/draft", draftRouter);
app.use("/api/time-tracking", timeTrackingRouter);
app.use("/api/ai", aiRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/beta", betaRouter);

// SOCKET LOGIC
socketHandler(io);

server.listen(process.env.PORT || 5000, (err) => {
  console.log(process.env.PORT);
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is listening on port ${process.env.PORT || 5000}`);
  }
});
