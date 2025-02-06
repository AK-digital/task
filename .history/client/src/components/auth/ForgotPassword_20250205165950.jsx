import { useState } from "react";
export default function ForgotPassword() {
  // import styles from './ForgotPassword.module.css';

  return (
    <div>
      <div>
        <span>Vous avez oublié votre mot de passe ?</span>
      </div>
      <form>
        <div>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i data-error={true}>Identifiants incorrects, veuillez réessayer.</i>
        </div>
        <button type="submit">Soumettre</button>
      </form>
    </div>
  );
}
