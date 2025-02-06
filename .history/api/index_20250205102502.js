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
import projectRouter from "./routes/project.routes.js";
import boardRouter from "./routes/board.routes.js";
import taskRouter from "./routes/task.routes.js";
import messageRouter from "./routes/message.routes.js";
import UserModel from "./models/User.model.js";
import NotificationModel from "./models/Notification.model.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const corsOptions = {
  origin: process.env.CLIENT_URL,
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
app.use("/api/notification", notificationRouter);

app.use("/api/project", projectRouter);
app.use("/api/board", boardRouter);
app.use("/api/task", taskRouter);
app.use("/api/message", messageRouter);

// SOCKET LOGIC
const connectedUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  connectedUsers.set(userId, socket.id);

  socket.on("project invitation", async (email, project) => {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return;
    }

    const newNotification = new NotificationModel({
      userId: user?._id,
      message: {
        title: `🎉 Invitation à ${project?.name} !`,
        content: `Bonne nouvelle ! Vous avez été invité pour rejoindre le projet "${project?.name}".`,
      },
    });

    await newNotification.save();

    // Récupérer le socketId de l'utilisateur invité
    const userSocketId = connectedUsers.get(user._id.toString());

    if (userSocketId) {
      io.to(userSocketId).emit("new notification");
    }
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(userId);
  });
});

server.listen(process.env.PORT || 4000, (err) => {
  console.log(process.env.PORT);
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is listening on port ${process.env.PORT || 4000}`);
  }
});
