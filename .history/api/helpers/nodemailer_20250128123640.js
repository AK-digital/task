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
    rejectUnauthorized: false,
  },
});

export async function sendEmail(from, to, subject, text) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: text, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}
