export function emailDescription() {
  const templates = {
    subjet: `Vous avez été identifié dans un message dans Täsk`,
    text: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
      <h1 style="color: #5056C8;">Identifié dans un message</h1>
      <p>Bonjour,</p>
      <p>Vous avez été identifié dans ce message : <strong>${savedMessage?.message}</strong>. 
      </div>
      `,
  };
}
