import NotificationModel from "../models/Notification.model.js";

export async function getNotifications(req, res, next) {
  try {
    const authUser = res.locals.user;

    const notifications = await NotificationModel.find({
      userId: authUser?._id,
    })
      .sort("-createdAt")
      .populate("senderId", "firstName lastName picture")
      .exec();

    if (notifications?.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucune notifications trouvées",
        data: notifications,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Notifications trouvées",
      data: notifications,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function readNotification(req, res, next) {
  try {
    const authUser = res.locals.user;

    const notification = await NotificationModel.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: authUser?._id,
      },
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

    if (!notification) {
      return res.status(404).send({
        success: false,
        message: "Impossible de lire une notification inexistante",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Notification lue",
      data: notification,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function readNotifications(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { notificationIds } = req.body;

    const notifications = await NotificationModel.updateMany(
      {
        _id: { $in: notificationIds },
        userId: authUser?._id,
      },
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

    if (!notifications) {
      return res.status(404).send({
        success: false,
        message: "Impossible de lire des notifications inexistantes",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Notifications lues",
      data: notifications,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
