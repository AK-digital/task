import { emailTranslations } from "./emailTranslations.js";

const emailStyles = {
  container:
    "font-family: Arial, sans-serif; color: #4a4a4a; text-align: center; padding: 20px; margin-inline: auto;",
  title: "font-size: 32px; font-weight: bold;",
  subtitle:
    "font-size: 28px; max-width: 450px; margin-inline: auto; font-weight: 500;",
  paragraph:
    "font-size: 20px; font-weight: 300; text-align: center; margin-bottom:30px;",
  content: "font-size: 20px; font-weight: 300; margin-bottom: 20px;",
  button:
    "background-color: #a87e51; outline: none; border: none; border-radius: 32px; padding: 16px 24px; color: #FFFFFF; font-weight: 500; font-size:18px; text-decoration: none;",
  highlight: "color: #a87e51;",
};

export function emailFeedback(user, note, feedback, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].feedback;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.paragraph}">${t.greeting},</p>
        <p style="${emailStyles.content}">${t.newFeedback}</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a87e51;">
          <p style="margin: 0; font-size: 18px; font-weight: 500;">
            ${t.email} : <span style="${emailStyles.highlight}">${user?.email}</span>
          </p>
        </div>
        <p style="${emailStyles.content}">${t.feedback}</p>
        <p style="${emailStyles.content}">${t.note} : ${note}</p>
        <p style="${emailStyles.content}">${feedback}</p>
      </div>
    `,
  };
}

export function emailBetaRequest(link, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].beta.request;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.paragraph}">${t.greeting},</p>
        <p style="${emailStyles.content}">${t.confirmation}</p>
        <p style="${emailStyles.content}">${t.instruction}</p>
        <div style="margin: 30px 0;">
          <a href="${link}" style="${emailStyles.button}">
            ${t.button}
          </a>
        </div>
        <p style="${emailStyles.content}">${t.nextSteps}</p>
        <p style="${emailStyles.content}">${t.thanks}</p>
      </div>
    `,
  };
}

export function emailBetaRequestAdmin(userEmail, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].beta.admin;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.paragraph}">${t.greeting},</p>
        <p style="${emailStyles.content}">${t.newRequest}</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a87e51;">
          <p style="margin: 0; font-size: 18px; font-weight: 500;">
            ${t.email} : <span style="${emailStyles.highlight}">${userEmail}</span>
          </p>
        </div>
      </div>
    `,
  };
}

export function emailDescription(sender, task, link, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].description;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <h2 style="${emailStyles.subtitle}">${sender?.firstName} ${sender?.lastName} ${t.mentioned} :</h2>
        <div style="${emailStyles.content}">"${task?.description?.text}"</div>
        <div>
          <a href=${link} style="${emailStyles.button}">${t.button}</a>
        </div>
      </div>
    `,
  };
}

export function emailMessage(sender, message, link, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].message;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.paragraph}">${sender?.firstName} ${sender?.lastName} ${t.mentioned}.</p>
        <div style="${emailStyles.content}">${message?.message}</div>
        <a href=${link} style="${emailStyles.button}">
          ${t.button}
        </a>
      </div>
    `,
  };
}

export function emailProjectInvitation(project, sender, link, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].project.invitation;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.paragraph}">${sender?.firstName} ${sender?.lastName} ${t.invited} <span style="${emailStyles.highlight}">${project?.name}</span>.</p>
        <a href=${link} style="${emailStyles.button}">
          ${t.button}
        </a>
      </div>
    `,
  };
}

export function emailTaskAssigned(task, sender, projectLink, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].task.assigned;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.content}">${sender?.firstName} ${sender?.lastName} ${t.assigned} <span style="${emailStyles.highlight}">${task?.text}</span> ${t.onProject} <span style="${emailStyles.highlight}">${task?.projectId?.name}</span>.</p>
        <a href=${projectLink} style="${emailStyles.button}">
          ${t.button}
        </a>
      </div>
    `,
  };
}

export function emailResetCode(user, resetLink, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].reset;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.paragraph}">${t.greeting} ${user?.firstName},</p>
        <p style="${emailStyles.content}">${t.instruction}</p>
        <p style="${emailStyles.content}">${t.nextStep}</p>
        <div>
          <a href="${resetLink}" style="${emailStyles.button}">
            ${t.button}
          </a>
        </div>
      </div>
    `,
  };
}

export function emailVerification(user, verificationLink, recipient) {
  const t = emailTranslations[recipient?.language || "fr"].verification;
  return {
    subject: t.subject,
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">${t.title}</h1>
        <p style="${emailStyles.paragraph}">${t.greeting} ${user?.firstName},</p>
        <p style="${emailStyles.content}">${t.instruction}</p>
        <div>
          <a href="${verificationLink}" style="${emailStyles.button}">
            ${t.button}
          </a>
        </div>
      </div>
    `,
  };
}
