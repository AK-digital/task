export function emailDescription(user, task) {
  const templates = {
    subjet: `Vous avez été identifié dans une description`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #5C5D61;; text-align: center; padding: 20px; margin-inline: auto;">
      <h1 style="font-size: 40px; font-weight: bold;">Hey ! Par ici 🙋‍♂️</h1>
      <h2 style="font-size: 28px; max-width: 450px; margin-inline: auto; font-weight: 500;">${
        user?.firstName + " " + user?.lastName
      } vous a mentionné dans <span style="color: #777AE4;">cette description</span>
      </h2>
      <div style="font-size: 20px; font-weight: 300;">
        "${task?.description}"
      </div>
      <div>
      <button style="background-color: #777AE4; outline: none; border: none; border-radius: 32px; padding: 16px 24px; color: #FFFFFF; font-weight: 500;">
        Accéder à la description
      </button>
      </div>
      </div>
      `,
  };

  return templates;
}

export function emailMessage(user, message) {
  const templates = {
    subjet: `Vous avez été identifié dans une conversation`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #5C5D61;; text-align: center; padding: 20px; margin-inline: auto;">
      <h1 style="font-size: 40px; font-weight: bold;">Hey ! Par ici 🙋‍♂️</h1>
      <h2 style="font-size: 28px; max-width: 450px; margin-inline: auto; font-weight: 500;">${
        user?.firstName + " " + user?.lastName
      } vous a mentionné dans <span style="color: #777AE4;">cette conversation</span>
      </h2>
      <div style="font-size: 20px; font-weight: 300;">
        "${message?.message}"
      </div>
      <div>
      <button style="background-color: #777AE4; outline: none; border: none; border-radius: 32px; padding: 16px 24px; color: #FFFFFF; font-weight: 500;">
        Accéder à la conversation
      </button>
      </div>
      </div>
      `,
  };

  return templates;
}

export function emailProjectInvitation(user, message) {
  const subjet = `Invitation au projet : ${project?.name}`;
  const text = `
    <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
      <h1 style="color: #5056C8;">Invitation à rejoindre un nouveau projet sur Täsk</h1>
      <p>Bonjour,</p>
      <p>Vous avez été invité à participer à un nouveau projet par <strong>${authEmail}</strong> sur <strong>${project.name}</strong>. 
      Cette opportunité vous permettra de collaborer avec votre équipe et de contribuer à l’avancement du projet.</p>
      <p>Pour confirmer votre participation, veuillez cliquer sur le boutton ci-dessous :</p>
      <div style="margin: 20px 0;">
      <a href="http://localhost:3000/invitation/6798933e0d34aadab7450496">
        <button style="background-color: #5056C8; color: white; border: none; padding: 20px 20px; font-size: 16px; margin: 5px; cursor: pointer; font-weight: bold; border-radius: 8px;">
          Accepter l'invitation
        </button>
      </a>
      </div>
      <p style="font-size: 12px; color: #777;">Si vous n’êtes pas intéréssé par cette invitation, veuillez ignorer cet e-mail.</p>
    </div>
    `;
  const templates = {
    subjet: `Vous avez été identifié dans une conversation`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #5C5D61;; text-align: center; padding: 20px; margin-inline: auto;">
      <h1 style="font-size: 40px; font-weight: bold;">Hey ! Par ici 🙋‍♂️</h1>
      <h2 style="font-size: 28px; max-width: 450px; margin-inline: auto; font-weight: 500;">${
        user?.firstName + " " + user?.lastName
      } vous a mentionné dans <span style="color: #777AE4;">cette conversation</span>
      </h2>
      <div style="font-size: 20px; font-weight: 300;">
        "${message?.message}"
      </div>
      <div>
      <button style="background-color: #777AE4; outline: none; border: none; border-radius: 32px; padding: 16px 24px; color: #FFFFFF; font-weight: 500;">
        Accéder à la conversation
      </button>
      </div>
      </div>
      `,
  };

  return templates;
}
