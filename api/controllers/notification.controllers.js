import NotificationModel from "../models/Notification.model.js";

export async function getNotifications(req, res, next) {
  try {
    const authUser = res.locals.user;

    const notifications = await NotificationModel.find({
      userId: authUser?._id,
    });

    if (notifications.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucune notifications trouvées",
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
