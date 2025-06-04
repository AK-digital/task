import { sendEmail } from "../helpers/nodemailer.js";
import { betaRequestValidation } from "../helpers/zod.js";
import BetaRequestModel from "../models/BetaRequest.model.js";
import UserModel from "../models/User.model.js";
import {
  emailBetaRequest,
  emailBetaRequestAdmin,
} from "../templates/emails.js";

export async function sendBetaRequest(req, res) {
  try {
    const { email } = req.body;

    const isValid = betaRequestValidation.safeParse({ email });

    if (!isValid.success) {
      const { errors } = isValid.error;

      return res.status(400).send({
        success: false,
        message: "Invalid parameters",
        errors: errors,
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (user) {
      return res.status(409).send({
        success: false,
        message: "User already exists",
      });
    }

    const token = crypto.randomUUID(20).toString("hex");

    const betaRequest = new BetaRequestModel({
      email: email,
      token: token,
    });

    const savedBetaRequest = await betaRequest.save();

    if (!savedBetaRequest) {
      return res.status(400).send({
        success: false,
        message: "Failed to send beta request",
      });
    }

    const link = `${process.env.CLIENT_URL}/verification/beta/${token}`;

    const templateRequest = emailBetaRequest(link);

    await sendEmail(
      "notifications@clynt.io",
      email,
      templateRequest.subject,
      templateRequest.text
    );

    const templateConfirmation = emailBetaRequestAdmin(email);

    await sendEmail(
      "notifications@clynt.io",
      "aurelien@akdigital.fr",
      templateConfirmation.subject,
      templateConfirmation.text
    );

    return res.status(201).send({
      success: true,
      message: "Beta request sent successfully",
      data: savedBetaRequest,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).send({
      success: false,
      message: err.message || "An unexpected error occurred",
    });
  }
}

export async function confirmBetaRequest(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Missing parameters",
      });
    }

    const betaRequest = await BetaRequestModel.findOne({ token: token });

    if (!betaRequest) {
      return res.status(404).send({
        success: false,
        message: "Beta request not found",
      });
    }

    if (betaRequest.verified) {
      return res.status(409).send({
        success: false,
        message: "Beta request already confirmed",
      });
    }

    const updatedBetaRequest = await BetaRequestModel.findOneAndUpdate(
      { token: token },
      { verified: true },
      { new: true }
    );

    if (!updatedBetaRequest) {
      return res.status(500).send({
        success: false,
        message: "Failed to confirm beta request",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Beta request confirmed successfully",
      data: updatedBetaRequest,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "An unexpected error occurred",
    });
  }
}
