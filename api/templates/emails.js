const emailStyles = {
  container:
    "font-family: Arial, sans-serif; color:#4a4a4a; text-align: center; padding: 20px; margin-inline: auto;",
  title: "font-size: 40px; font-weight: bold;",
  subtitle:
    "font-size: 28px; max-width: 450px; margin-inline: auto; font-weight: 500;",
  paragraph:
    "font-size: 20px; font-weight: 300; text-align: center; margin-bottom:30px;",
  content: "font-size: 20px; font-weight: 300; margin-bottom: 20px;",
  button:
    "background-color: #777AE4; outline: none; border: none; border-radius: 32px; padding: 16px 24px; color: #FFFFFF; font-weight: 500; font-size:18px; text-decoration: none;",
  highlight: "color: #777AE4;",
};

export function emailDescription(sender, task, link) {
  const templates = {
    subjet: `Vous avez été identifié dans une description`,
    text: `
      <div style="${emailStyles.container}">
      <h1 style="${emailStyles.title}">Hey ! Par ici 🙋‍♂️</h1>
      <h2 style="${emailStyles.subtitle}">${
      sender?.firstName + " " + sender?.lastName
    } vous a mentionné dans <span style="${
      emailStyles.highlight
    }">cette description</span></h2>
      <div style="${emailStyles.content}">
        "${task?.description?.text}"
      </div>
      <div>
       <a href=${link} style="${emailStyles.button}">
            Accéder à la description
       </a>
      </div>
      </div>
      `,
  };
  return templates;
}

export function emailMessage(sender, message, link) {
  const templates = {
    subjet: `Vous avez été identifié dans une conversation`,
    text: `
      <div style="${emailStyles.container}">
      <h1 style="${emailStyles.title}">Hey ! Par ici 🙋‍♂️</h1>
      <p style="${emailStyles.paragraph}">${
      sender?.firstName + " " + sender?.lastName
    } vous a mentionné dans <span style="${
      emailStyles.highlight
    }">cette conversation</span></p>
      <div style="${emailStyles.content}">
        ${message?.message}
      </div>
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
    subjet: `Vous avez été invité à rejoindre un projet`,
    text: `
      <div style="${emailStyles.container}">
      <h1 style="${emailStyles.title}">La chaaance 🍀</h1>
      <p style="${emailStyles.paragraph}">${
      sender?.firstName + " " + sender?.lastName
    } vous a invité à rejoindre le projet <span style="${
      emailStyles.highlight
    }">${project?.name}</span>.</p>
      <a href=${link} style="display:inline-block;width:auto;background-color: #777AE4; outline:none; border:none; border-radius:32px; padding:16px 24px; color: #FFFFFF;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:8px;font-size:16px;">
          Accéder au projet
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
    } vous a assigné à la tâche <span style="${emailStyles.highlight}">${
      task?.text
    }</span> sur le projet <span style="${emailStyles.highlight}">${
      task?.projectId?.name
    }</span>.</p>
       <a href=${projectLink} style="display:inline-block;width:auto;background-color: #777AE4; outline:none; border:none; border-radius:32px; padding:16px 24px; color: #FFFFFF;font-weight:600;cursor:pointer;text-decoration:none;margin-bottom:8px;font-size:16px;">
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
        <h1 style="${emailStyles.title}">Vérification de votre adresse email</h1>
        <p style="${emailStyles.paragraph}">Bonjour ${user?.firstName},</p>
        <p style="${emailStyles.content}">Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
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
