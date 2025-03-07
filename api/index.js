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
import projectRouter from "./routes/project.routes.js";
import projectInvitations from "./routes/projectInvitation.routes.js";
import boardRouter from "./routes/board.routes.js";
import taskRouter from "./routes/task.routes.js";
import messageRouter from "./routes/message.routes.js";

import UserModel from "./models/User.model.js";
import NotificationModel from "./models/Notification.model.js";
import ProjectModel from "./models/Project.model.js";
import BoardModel from "./models/Board.model.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  addTrailingSlash: false,
  transports: ["websocket", "polling"],
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
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

app.use("/api/template", templateRouter);

app.use("/api/project", projectRouter);
app.use("/api/project-invitation", projectInvitations);
app.use("/api/board", boardRouter);
app.use("/api/task", taskRouter);
app.use("/api/message", messageRouter);

// SOCKET LOGIC
io.on("connection", (socket) => {
  socket.on("logged in", async (userId) => {
    if (userId) {
      const user = await UserModel.findById({ _id: userId });

      if (!user) {
        throw new Error("Aucun utilisateur trouvé avec cette ID : ", userId);
      }

      const userWithSocketId = await UserModel.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            socketId: socket?.id,
          },
        },
        {
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      socket.emit("logged in", userWithSocketId);
    }
  });

  socket.on("create notification", async (sender, receiver, message, link) => {
    const senderUser = await UserModel.findById({ _id: sender?._id });
    let receiverUser = null;

    if (receiver.includes("@")) {
      receiverUser = await UserModel.findOne({
        email: receiver,
      });
    } else {
      receiverUser = await UserModel.findById({ _id: receiver });
    }

    // Create a new notification for the user
    const newNotification = new NotificationModel({
      userId: receiverUser?._id,
      senderId: senderUser?._id,
      message: message,
      link: link,
    });

    await newNotification.save();

    io.to(receiverUser?.socketId).emit("new notification");
  });

  socket.on("unread notifications", async (unreadNotifications) => {
    const user = await UserModel.findById({
      _id: unreadNotifications[0]?.userId,
    });

    // Mark all the unread notifications as read
    unreadNotifications?.forEach(async (notif) => {
      await NotificationModel.findByIdAndUpdate(
        { _id: notif?._id },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    });

    // Emit to the user that the notifications have been read so we can update the UI
    io.to(user?.socketId).emit("notifications read");
  });

  // Project invitation
  socket.on("accept project invitation", async (projectId) => {
    // Find the project
    const project = await ProjectModel.findById({ _id: projectId });

    if (!project) return; // If the project doesn't exist, return

    const guests = [...project?.guests, project?.author];

    // Emit to all the guests of the project that a new member has joined
    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest });
      io.to(user?.socketId).emit("accepted project invitation", project?._id);
    });
  });

  // Task update
  socket.on("task text update", async (guests, taskId, value) => {
    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest._id });
      io.to(user?.socketId).emit("task text updated", taskId, value);
      io.to(user?.socketId).emit("task updated");
    });
  });

  socket.on("task responsible update", async (guests, taskId, responsible) => {
    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest._id });
      io.to(user?.socketId).emit(
        "task responsible updated",
        taskId,
        responsible
      );
      io.to(user?.socketId).emit("task updated");
    });
  });

  socket.on("task status update", async (guests, taskId, optimisticValue) => {
    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest._id });
      io.to(user?.socketId).emit(
        "task status updated",
        taskId,
        optimisticValue
      );
      io.to(user?.socketId).emit("task updated");
    });
  });

  socket.on("task priority update", (guests, taskId, optimisticValue) => {
    // Emit to all the guests of the project that a task has been updated
    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest._id });
      io.to(user?.socketId).emit(
        "task priority updated",
        taskId,
        optimisticValue
      );
      io.to(user?.socketId).emit("task updated");
    });
  });
  // task deadline
  socket.on("task deadline update", async (guests) => {
    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest._id });
      io.to(user?.socketId).emit("task updated");
    });
  });

  socket.on("update board", async (boardId, projectId) => {
    const project = await ProjectModel.findById({ _id: projectId });
    const board = await BoardModel.findById({ _id: boardId });

    if (!project || !board) return;

    const guests = [...project?.guests, project?.author];

    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest });

      io.to(user?.socketId).emit("board updated", board);
    });
  });

  socket.on("update task", async (projectId) => {
    const project = await ProjectModel.findById({ _id: projectId });

    if (!project) return;

    const guests = [...project?.guests, project?.author];

    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest });
      io.to(user?.socketId).emit("task updated");
    });
  });

  socket.on("update message", async (projectId) => {
    const project = await ProjectModel.findById({ _id: projectId });

    if (!project) return;

    const guests = [...project?.guests, project?.author];

    guests?.forEach(async (guest) => {
      const user = await UserModel.findById({ _id: guest });
      io.to(user?.socketId).emit("message updated");
    });
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
