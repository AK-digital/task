export function emailDescription(user, task) {
  const templates = {
    subjet: `Vous avez été identifié dans une des dans Täsk`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #5C5D61;; text-align: center; padding: 20px; margin-inline: auto;">
      <h1 style="font-size: 40px; font-weight: bold;">Hey ! Par ici 🙋‍♂️</h1>
      <h2 style="font-size: 28px; max-width: 450px; margin-inline: auto;">${
        user?.firstName + " " + user?.lastName
      } vous a mentionné dans <span style="color: #777AE4;">cette description</span>
      </h2>
      <p style="font-size: 20px; display: inline;">
        "${task?.description}"
      </p>
      <div>
      <button>Accéder à la description</button>
      </div>
      </div>
      `,
  };

  return templates;
}
