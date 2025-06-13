import nodemailer from "nodemailer";
import UserModel from "../models/User.model.js";

const transporter = nodemailer.createTransport({
  host: `${process.env.EMAIL_HOST}`,
  port: process.env.EMAIL_PORT,
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.EMAIL_PASS}`,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: true,
    requestCert: false,
    minVersion: "TLSv1.2",
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

function stripHtmlTags(html) {
  return html?.replace(/<[^>]*>?/gm, "");
}

export async function sendEmail(from, to, subject, text) {
  try {
    // Rechercher l'utilisateur par email pour obtenir sa langue
    const user = await UserModel.findOne({ email: to });
    const userLanguage = user?.language || "fr"; // Par défaut en français si l'utilisateur n'existe pas

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Clynt.io" <${from}>`, // sender address with display name
      to: to, // list of receivers
      replyTo: from,
      subject: subject, // Subject line
      text: stripHtmlTags(text),
      html: `
        <body style="margin: 0; padding: 0; background-color: #F6F4E9;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" valign="middle">
                <table width="100%" maxwidth="700" border="0" cellspacing="0" cellpadding="0" style="max-width: 700px; margin:42px;">
                  <tr>
                    <td align="center" style="padding: 20px;">
                      <div style="font-family: Arial, sans-serif; color: #5C5D61; text-align: center; background-color: white; width: 100%; border-radius:16px; border-top: 4px solid #a87e51; padding: 20px;">
                        ${text}
                      </div>
                      <div style="font-family: Arial, sans-serif; color: #72716f; text-align: center; font-size: 12px; margin-top: 20px; max-width: 460px;">
                        <p style="margin: 0;">
                          ${
                            userLanguage === "fr"
                              ? "Conformément à la réglementation en vigueur, cet email vous est adressé dans le cadre de votre relation avec AK Digital. Si vous pensez avoir reçu ce message par erreur, vous pouvez l'ignorer ou nous contacter."
                              : "In accordance with current regulations, this email is sent to you as part of your relationship with AK Digital. If you believe you received this message by error, you can ignore it or contact us."
                          }
                        </p>
                      </div>
                       <div style="margin-top:16px;font-size:12px;font-weight:600;color:#72716f;">
                        ${
                          userLanguage === "fr"
                            ? 'L\'équipe d\'<a href="https://akdigital.fr" style="color:#a87e51;text-decoration:none;">AK Digital</a>'
                            : 'The <a href="https://akdigital.fr" style="color:#a87e51;text-decoration:none;">AK Digital</a> team'
                        }
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>`,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
