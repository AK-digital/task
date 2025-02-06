export default function ForgotPassword() {
  import { useState } from "react";
  // import styles from './ForgotPassword.module.css';

  const useActionState = (initialState) => {
    const [state, setState] = useState(initialState);
    const setActionState = (action) => {
      setState((prevState) => ({ ...prevState, ...action }));
    };
    return [state, setActionState];
  };

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
