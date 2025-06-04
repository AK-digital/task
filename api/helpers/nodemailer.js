import nodemailer from "nodemailer";

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
              <table width="100%" maxwidth="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin:42px;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <div style="font-family: Arial, sans-serif; color: #5C5D61; text-align: center; background-color: white; width: 100%; border-radius:16px; border-top: 4px solid #a87e51; padding: 20px;">
                      ${text}
                    </div>
                    <div style="font-family: Arial, sans-serif; color: #72716f; text-align: center; font-size: 12px; margin-top: 20px; max-width: 460px;">
                      <p style="margin: 0;">
                        Conformément à la réglementation en vigueur, cet email vous est adressé dans le cadre de votre relation avec AK Digital. Si vous pensez avoir reçu ce message par erreur, vous pouvez l'ignorer ou nous contacter.
                      </p>
                    </div>
                     <div style="margin-top:16px;font-size:12px;font-weight:600;color:#72716f;">
                      Fait avec ❤️ par l'équipe d'<a href="https://akdigital.fr" style="color:#a87e51;text-decoration:none;">AK Digital</a>
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
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}
