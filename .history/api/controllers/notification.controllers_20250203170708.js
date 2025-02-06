import NotificationModel from "../models/Notification.model";

export async function getNotifications(req, res, next) {
  try {
    const authUser = res.locals.user;
    const notifications = await NotificationModel.find({ user: authUser?._id });

    return res.status(200).send({
      success: true,
      message: "Notifications trouvées"
      notifications,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
