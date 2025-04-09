import UserModel from "../models/User.model.js";
import NotificationModel from "../models/Notification.model.js";
import ProjectModel from "../models/Project.model.js";
import BoardModel from "../models/Board.model.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    socket.on("logged in", async (userId) => {
      if (!userId) return;

      const user = await UserModel.findById({ _id: userId });
      if (!user) {
        throw new Error("Aucun utilisateur trouvé avec cette ID : ", userId);
      }

      const userWithSocketId = await UserModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { socketId: socket?.id } },
        { new: true, setDefaultsOnInsert: true }
      );

      socket.emit("logged in", userWithSocketId);
    });

    socket.on(
      "create notification",
      async (sender, receiver, message, link) => {
        const senderUser = await UserModel.findById({ _id: sender?._id });

        if (senderUser) {
          let receiverUser = null;

          if (receiver.includes("@")) {
            receiverUser = await UserModel.findOne({
              email: receiver,
            });
          } else {
            receiverUser = await UserModel.findById({ _id: receiver });
          }

          const newNotification = new NotificationModel({
            userId: receiverUser?._id,
            senderId: senderUser?._id,
            message: message,
            link: link,
          });

          await newNotification.save();

          io.to(receiverUser?.socketId).emit("new notification");
        }
      }
    );

    socket.on("unread notifications", async (unreadNotifications) => {
      const user = await UserModel.findById({
        _id: unreadNotifications[0]?.userId,
      });

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

      io.to(user?.socketId).emit("notifications read");
    });

    socket.on("accept project invitation", async (projectId) => {
      await emitToProjectMembers(
        projectId,
        "accepted project invitation",
        io,
        projectId
      );
    });

    socket.on("update board", async (boardId, projectId) => {
      const project = await ProjectModel.findById({ _id: projectId });
      const board = await BoardModel.findById({ _id: boardId });

      if (!project || !board) return;

      project?.members?.forEach(async (member) => {
        const user = await UserModel.findById({ _id: member?.user });

        if (!user) return;

        io.to(user?.socketId).emit("board updated", board);
      });
    });

    socket.on("update task", async (projectId) => {
      await emitToProjectMembers(projectId, "task updated", io);
    });

    socket.on("update message", async (projectId) => {
      await emitToProjectMembers(projectId, "message updated", io);
    });

    socket.on("update-project-role", async (memberId) => {
      const user = await UserModel.findById({ _id: memberId });

      if (user) {
        io.to(user?.socketId).emit("updated-project-role");
      }
    });
  });
}

async function emitToProjectMembers(projectId, event, io, ...args) {
  const project = await ProjectModel.findById({ _id: projectId });

  if (!project) return;

  const members = project?.members;

  members?.forEach(async (member) => {
    const user = await UserModel.findById({ _id: member?.user });

    if (!user) return;

    if (args) {
      io.to(user?.socketId).emit(event, ...args);
    } else {
      io.to(user?.socketId).emit(event);
    }
  });
}
