"use client";
import { useParams } from "next/navigation";

export default function ForgotPassword() {
  const params = useParams();
  const { id } = params;
  const resetCode = id;

  return (
    <main>
      <div>
        <h1>Mot de passe oublié</h1>
        <form>
          <label htmlFor="email">Email :</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="newPassword">Nouveau mot de passe :</label>
          <input type="password" id="newPassword" name="newPassword" required />
          <label htmlFor="confirmPassword">Confirmez le mot de passe :</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
          />
          <input
            type="text"
            id="reset-code"
            name="reset-code"
            defaultValue={resetCode}
            hidden
          />
          <button type="submit">Réinitialiser le mot de passe</button>
        </form>
      </div>
    </main>
  );
}
