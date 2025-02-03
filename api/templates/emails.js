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

export function emailProjectInvitation(project, sender, link) {
  const templates = {
    subjet: `Vous avez été invité à rejoindre un projet`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #5C5D61;; text-align: center; padding: 20px; margin-inline: auto;">
      <h1 style="font-size: 40px; font-weight: bold;">La chaaance 🍀</h1>
      <div style="font-size: 20px; font-weight: 300; max-width: 300px;">
       <p>
         ${sender?.firstName + " " + sender?.lastName}
          vous a invité à rejoindre le projet <span>${project?.name}</span>
       </p>
      </div>
      <div>
      <a href=${link}>
        <button style="background-color: #777AE4; outline: none; border: none; border-radius: 32px; padding: 16px 24px; color: #FFFFFF; font-weight: 500;">
          Accéder au projet
        </button>
      </a>
      </div>
      </div>
      `,
  };

  return templates;
}
