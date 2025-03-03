import { sendResetCode } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { bricolageGrostesque, instrumentSans } from "@/utils/font";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SendResetCodeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [state, formAction, pending] = useActionState(
    sendResetCode,
    initialState
  );

  useEffect(() => {
    setMessageStatus("");
    if (state?.status === "success") {
      setMessageStatus("Un email de réinitialisation a été envoyé.");
    }

    if (state?.status === "failure" && !state?.errors?.email) {
      setMessageStatus("Une erreur inattendue s'est produite");
    }
  }, [state]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>Mot de passe oublié</div>
      {messageStatus && (
        <div className={styles.messageStatus}>
          <span data-status={state?.status}>{messageStatus}</span>
        </div>
      )}
      <form className={styles.form} action={formAction}>
        <div className="form-group">
          <label
            htmlFor="email"
            className={styles.emailLabel}
            data-active={email.length > 0}
          >
            Adresse e-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.email}
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
            className={bricolageGrostesque.className}
            data-disabled={pending}
            disabled={pending}
          >
            Réinitialiser le mot de passe
          </button>
        </div>
      </form>
      <div className={styles.text}>
        <p>
          <span
            onClick={(e) => {
              router.push("/");
            }}
          >
            Retourner sur l'écran de connexion
          </span>
        </p>
      </div>
    </div>
  );
}
