export function emailDescription(user, model) {
  const templates = {
    subjet: `Vous avez été identifié dans une des dans Täsk`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
      <h1 style="color: #5C5D61;  font-weight: 500;">Hey ! Par ici 🙋‍♂️</h1>
      <h2>${
        user?.firstName + " " + user?.lastName
      } vous a mentionné dans <span style="color: #777AE4;">cette discussion</span>
      </h2>
<p></p>
    
      </div>
      `,
  };

  return templates;
}
