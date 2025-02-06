import { sendResetCode } from "@/actions/auth";
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
  const [state, formAction, pending] = useActionState(
    sendResetCode,
    initialState
  );

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Vous avez oublié votre mot de passe ?</span>
      </div>
      <form className={styles.form} formAction={formAction}>
        <div>
          <input type="email" id="email" placeholder="Email" required />
          {state?.errors?.email && (
            <i data-error={true}>{state?.errors?.email}</i>
          )}
        </div>
        <div className={styles.buttons}>
          <button
            type="submit"
            className={instrumentSans.className}
            data-disabled={pending}
            disabled={pending}
          >
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
