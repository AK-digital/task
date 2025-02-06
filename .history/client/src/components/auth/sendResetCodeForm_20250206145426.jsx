import { sendResetCode } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { instrumentSans } from "@/utils/font";
import { useActionState, useEffect, useState } from "react";
const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SendResetCodeForm({ setForgotPassword, setSignIn }) {
  const [messageStatus, setMessageStatus] = useState("");
  const [state, formAction, pending] = useActionState(
    sendResetCode,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      setMessageStatus("Un email de réinitialisation a été envoyé.");
    }

    if (state?.status === "failure" && !state?.errors?.email) {
      setMessageStatus("Une erreur s'est produite. Veuillez réessayer.");
    }
  }, [state]);

  console.log(state);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Vous avez oublié votre mot de passe ?</span>
      </div>
      <form className={styles.form} action={formAction}>
        <div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
          />
          {state?.errors?.email && (
            <div className={styles.emailErr}>
              <i data-error={true}>{state?.errors?.email}</i>
            </div>
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
