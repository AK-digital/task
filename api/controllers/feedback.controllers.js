import FeedbackModel from "../models/Feedback.model.js";
import sanitizeHtml from "sanitize-html";
import { emailFeedback } from "../templates/emails.js";
import { sendEmail } from "../helpers/nodemailer.js";

export async function saveFeedback(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { note, message } = req.body;

    const sanitizedMessage = sanitizeHtml(message);

    if (!message || !note) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const newFeedback = new FeedbackModel({
      userId: authUser._id,
      note: note,
      message: sanitizedMessage,
    });

    await newFeedback.save();

    const templateFeedback = emailFeedback(authUser, note, sanitizedMessage, {
      language: "fr",
    });

    await sendEmail(
      "notifications@clynt.io",
      "aurelien@akdigital.fr",
      templateFeedback.subject,
      templateFeedback.text
    );

    return res.status(201).send({
      success: true,
      message: "Feedback saved successfully",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
