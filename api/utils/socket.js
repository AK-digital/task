import UserModel from "../models/User.model.js";
import NotificationModel from "../models/Notification.model.js";
import ProjectModel from "../models/Project.model.js";
import TimeTrackingModel from "../models/TimeTracking.model.js";

const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedUser(userId) {
  const cacheKey = userId.toString();
  const cached = userCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }

  const user = await UserModel.findById({ _id: userId });

  if (user) {
    userCache.set(cacheKey, {
      user,
      timestamp: Date.now(),
    });
  }

  return user;
}

function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      userCache.delete(key);
    }
  }
}

// Nettoyer le cache toutes les 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    socket.on("logged in", async (userId) => {
      if (!userId) return;

      const user = await getCachedUser(userId);

      if (!user) {
        throw new Error("Aucun utilisateur trouvé avec cette ID : ", userId);
      }

      const userWithSocketId = await UserModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { socketId: socket?.id } },
        { new: true, setDefaultsOnInsert: true }
      );

      // Mettre à jour le cache avec le nouveau socketId
      userCache.set(userId.toString(), {
        user: userWithSocketId,
        timestamp: Date.now(),
      });

      const projects = await ProjectModel.find({ "members.user": user?._id });
      const projectIds = projects.map((project) => project._id.toString());

      socket.join(projectIds);

      socket.emit("logged in", userWithSocketId);
    });

    socket.on(
      "create notification",
      async (sender, receiver, message, link) => {
        const senderUser = await getCachedUser(sender?._id);

        if (senderUser) {
          let receiverUser = null;

          if (receiver.includes("@")) {
            receiverUser = await UserModel.findOne({
              email: receiver,
            });
          } else {
            receiverUser = await getCachedUser(receiver);
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
      const user = await getCachedUser(unreadNotifications[0]?.userId);

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

    socket.on("update board", async (projectId) => {
      const project = await ProjectModel.findById({ _id: projectId });

      if (!project) return;

      await Promise.all(
        project?.members?.map(async (member) => {
          const user = await getCachedUser(member?.user);
          if (!user) return;
          io.to(user?.socketId).emit("board updated");
        })
      );
    });

    socket.on("update board templates", async (projectId) => {
      const project = await ProjectModel.findById({ _id: projectId });
      if (!project) return;
      await emitToProjectMembers(projectId, "board templates updated", socket);
    });

    socket.on("update task", async (projectId) => {
      await emitToProjectMembers(projectId, "task updated", socket);
    });

    socket.on("archive board", async (data) => {
      const { projectId, action } = data;
      let firstEvent;
      let secondEvent;

      if (!projectId) return;

      if (action === "archive") {
        firstEvent = "board updated";
        secondEvent = "task updated";
      } else if (action === "restore") {
        firstEvent = "task updated";
        secondEvent = "board updated";
      }

      await Promise.all([
        emitToProjectMembers(projectId, firstEvent, socket),
        emitToProjectMembers(projectId, secondEvent, socket),
      ]);
    });

    socket.on("update message", async (projectId) => {
      await emitToProjectMembers(projectId, "message updated", socket);
    });

    socket.on("update-project", async (memberId, projectId) => {
      if (memberId) {
        const revokedUser = await getCachedUser(memberId);
        if (revokedUser?.socketId) {
          io.to(revokedUser.socketId).emit("member-revoked", memberId);
        }
      }

      await emitToProjectMembers(projectId, "project-updated", socket);
    });

    socket.on("update-project-invitation", async (projectId) => {
      await emitToProjectMembers(
        projectId,
        "project-invitation-updated",
        socket
      );
    });

    socket.on("update-project-invitation-role", async (projectId, roleData) => {
      await emitToProjectMembers(
        projectId,
        "project-invitation-role-updated",
        socket,
        roleData
      );
    });

    socket.on("update time tracking", async (trackingId) => {
      const timeTracking = await TimeTrackingModel.findById(trackingId);
      if (timeTracking) {
        await emitToProjectMembers(
          timeTracking.projectId,
          "time tracking updated",
          socket,
          trackingId
        );
      }
    });

    socket.on("redirect-project", async (projectId) => {
      const project = await ProjectModel.findById({ _id: projectId });

      if (!project) return;

      await Promise.all(
        project?.members?.map(async (member) => {
          const user = await getCachedUser(member?.user);
          if (!user) return;
          io.to(user?.socketId).emit("project-redirected");
        })
      );
    });

    socket.on("update user picture", async (userId) => {
      const user = await getCachedUser(userId);
      if (!user) return;

      const projects = await ProjectModel.find({ "members.user": userId });

      await Promise.all(
        projects.map(async (project) => {
          await emitToProjectMembers(
            project._id,
            "user picture updated",
            socket,
            userId
          );
        })
      );
    });

    socket.on("refresh-project-rooms", async (userId) => {
      if (!userId) return;

      const user = await getCachedUser(userId);
      if (!user) return;

      const projects = await ProjectModel.find({ "members.user": user?._id });
      const projectIds = projects.map((project) => project._id.toString());

      socket.join(projectIds);
    });
  });
}

async function emitToProjectMembers(projectId, event, socket, ...args) {
  if (!projectId) return;

  const projectIdString = projectId.toString();

  if (args.length > 0) {
    socket.to(projectIdString).emit(event, ...args);
  } else {
    socket.to(projectIdString).emit(event);
  }
}
