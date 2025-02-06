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
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="Nouveau mot de passe"
            required
          />
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirmez le mot de passe"
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
