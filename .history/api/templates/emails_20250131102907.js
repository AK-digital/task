export function emailDescription(user) {
  const templates = {
    subjet: `Vous avez été identifié dans une des dans Täsk`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
      <h1 style="color: #5C5D61;">Hey ! Par ici 🙋‍♂️</h1>
      <p>Bonjour,</p>
      <p>Vous avez été identifié dans ce message : <strong>${savedMessage?.message}</strong>. 
      </div>
      `,
  };

  return templates;
}
