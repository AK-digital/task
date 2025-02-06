import styles from "@/styles/components/auth/signIn.module.css";
import { instrumentSans } from "@/utils/font";
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
      <form className={styles.form}>
        <div>
          <label htmlFor="email">Email :</label>
          <input type="email" id="email" placeholder="Email" required />
          {/* {state?.errors?.email && (
            <i data-error={true}>Cette adresse mail n'existe pas</i>
          )} */}
        </div>
        <div className={styles.buttons}>
          <button type="submit" className={instrumentSans.className}>
            Réinitialiser le mot de passe
          </button>
        </div>
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
