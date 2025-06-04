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

export function emailBetaRequest(link) {
  const templates = {
    subject: "Demande de participation à la beta - Confirmation requise",
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">Demande de participation à la beta</h1>
        <p style="${emailStyles.paragraph}">Bonjour,</p>
        <p style="${emailStyles.content}">Nous avons bien reçu votre demande de participation à notre programme beta !</p>
        <p style="${emailStyles.content}">Pour finaliser votre inscription, merci de confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <div style="margin: 30px 0;">
          <a href="${link}" style="${emailStyles.button}">
            Confirmer mon email
          </a>
        </div>
        <p style="${emailStyles.content}">Une fois votre email confirmé, vous recevrez plus d'informations sur le programme beta et les prochaines étapes.</p>
        <p style="${emailStyles.content}">Merci de votre intérêt pour notre projet !</p>
      </div>
    `,
  };

  return templates;
}

export function emailBetaRequestAdmin(userEmail) {
  const templates = {
    subject: "Nouvelle demande de participation à la beta",
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">Nouvelle inscription beta !</h1>
        <p style="${emailStyles.paragraph}">Bonjour,</p>
        <p style="${emailStyles.content}">Un nouvel utilisateur vient de faire une demande de participation au programme beta !</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a87e51;">
          <p style="margin: 0; font-size: 18px; font-weight: 500;">
            📧 Email : <span style="${emailStyles.highlight}">${userEmail}</span>
          </p>
        </div>
      </div>
    `,
  };

  return templates;
}

export function emailDescription(sender, task, link) {
  const templates = {
    subjet: `Vous avez été mentionné dans une description`,
    text: `
      <div style="${emailStyles.container}">
      <h1 style="${emailStyles.title}">Vous avez été mentionné 👀</h1>
      <h2 style="${emailStyles.subtitle}">${sender?.firstName} ${sender?.lastName} vous a mentionné dans <span style="${emailStyles.highlight}">la description suivante</span> :</h2>
      <div style="${emailStyles.content}">"${task?.description?.text}"</div>
      <div>
      <a href=${link} style="${emailStyles.button}">Accéder à la description</a>
      </div>
      </div>
      `,
  };
  return templates;
}

export function emailMessage(sender, message, link) {
  const templates = {
    subjet: `Vous avez été mentionné dans une conversation`,
    text: `
      <div style="${emailStyles.container}">
      <h1 style="${emailStyles.title}">Un message vous concerne 💬</h1>
      <p style="${emailStyles.paragraph}">${sender?.firstName} ${sender?.lastName} vous a mentionné dans une <span style="${emailStyles.highlight}">conversation</span>.</p>
      <div style="${emailStyles.content}">${message?.message}</div>
        <a href=${link} style="display:inline-block;width:auto;background-color: #777AE4; outline:none; border:none; border-radius:32px; padding:16px 24px; color: #FFFFFF;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:8px;font-size:16px;">
          Accéder à la conversation
      </a>
    
      </div>
      `,
  };
  return templates;
}

export function emailProjectInvitation(project, sender, link) {
  const templates = {
    subjet: `Vous avez reçu une invitation à rejoindre un projet`,
    text: `
      <div style="${emailStyles.container}">
      <h1 style="${
        emailStyles.title
      }">Une nouvelle opportunité vous attend 🎯</h1>
      <p style="${emailStyles.paragraph}">${
      sender?.firstName + " " + sender?.lastName
    } vous a invité à rejoindre le projet <span style="${
      emailStyles.highlight
    }">${project?.name}</span>.</p>
      <a href=${link} style="display:inline-block;width:auto;background-color: #a87e51; outline:none; border:none; border-radius:32px; padding:16px 24px; color: #FFFFFF;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:8px;font-size:16px;">
          Rejoindre le projet
      </a>
      </div>
      `,
  };
  return templates;
}

export function emailTaskAssigned(task, sender, projectLink) {
  const templates = {
    subjet: `Vous avez été assigné à une tâche dans le projet ${task?.projectId?.name}`,
    text: `
      <div style="${emailStyles.container}">
      <h1 style="${emailStyles.title}">Une tâche vous a été assignée</h1>
      <p style="${emailStyles.content}">${
      sender?.firstName + " " + sender?.lastName
    } vous a assigné la tâche <span style="${emailStyles.highlight}">${
      task?.text
    }</span> sur le projet <span style="${emailStyles.highlight}">${
      task?.projectId?.name
    }</span>.</p>
      <a href=${projectLink} style="display:inline-block;width:auto;background-color: #a87e51; outline:none; border:none; border-radius:32px; padding:16px 24px; color: #FFFFFF;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:8px;font-size:16px;">
          Accéder au projet
      </a>
      </div>
      `,
  };
  return templates;
}

export function emailResetCode(user, resetLink) {
  const templates = {
    subjet: "Réinitialisation de votre mot de passe",
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">Réinitialisation du mot de passe</h1>
        <p style="${emailStyles.paragraph}">Bonjour ${user?.firstName},</p>
        <p style="${emailStyles.content}">Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p style="${emailStyles.content}">Cliquez sur le bouton ci-dessous pour continuer :</p>
        <div>
          <a href="${resetLink}" style="${emailStyles.button}">
            Réinitialiser mon mot de passe
          </a>
        </div>
      </div>
    `,
  };
  return templates;
}

export function emailVerification(user, verificationLink) {
  const templates = {
    subjet: "Vérification de votre adresse email",
    text: `
      <div style="${emailStyles.container}">
        <h1 style="${emailStyles.title}">Confirmez votre adresse email</h1>
        <p style="${emailStyles.paragraph}">Bonjour ${user?.firstName},</p>
        <p style="${emailStyles.content}">Merci de confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <div>
          <a href="${verificationLink}" style="${emailStyles.button}">
            Vérifier mon adresse email
          </a>
        </div>
      </div>
    `,
  };

  return templates;
}
