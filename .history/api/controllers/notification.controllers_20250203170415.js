import NotificationModel from "../models/Notification.model";

export async function getNotifications(req, res, next) {
  try {
    const notifications = await NotificationModel.find({ user: user?._id });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
