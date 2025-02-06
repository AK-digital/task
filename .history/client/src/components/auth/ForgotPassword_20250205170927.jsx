import styles from "@/styles/components/auth/signIn.module.css";
import { useActionState } from "react";
const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function ForgotPassword({ setForgotPassword, setSignIn }) {
  //   const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Vous avez oublié votre mot de passe ?</span>
      </div>
      <form>
        <div>
          <label htmlFor="email">Email :</label>
          <input type="email" id="email" placeholder="Email" required />
          {/* {state?.errors?.email && (
            <i data-error={true}>Cette adresse mail n'existe pas</i>
          )} */}
        </div>
        <button type="submit">Soumettre</button>
      </form>
      <div className={styles.text}>
        <p>
          Vous vous souvenez de votre mot de passe ?{" "}
          <span
            onClick={(e) => {
              setForgotPassword(false);
              setSignIn(true);
            }}
          >
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
}
