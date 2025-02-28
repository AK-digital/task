"use client";
import { resetForgotPassword } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function ResetForgotPasswordForm({ resetCode }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [state, formAction, pending] = useActionState(
    resetForgotPassword,
    initialState
  );

  useEffect(() => {
    setStatusMessage("");
    if (state?.status === "success") {
      setStatusMessage("Mot de passe réinitialisé avec succès");
    }
    if (
      state?.status === "failure" &&
      !state?.errors?.newPassword &&
      !state?.errors?.confirmPassword
    ) {
      setStatusMessage("Une erreur inattendue s'est produite");
    }
  }, [state]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        Réinitialisation de votre mot de passe ?
      </div>
      {statusMessage && (
        <div className={styles.messageStatus}>
          <span data-status={state?.status}>{statusMessage}</span>
        </div>
      )}
      {state?.status !== "success" && (
        <form className={styles.form} action={formAction}>
          <div className={styles.formGroup}>
            <label
              htmlFor="newPassword"
              className={styles.passwordLabel}
              data-active={password.length > 0}
            >
              Nouveau mot de passe
            </label>
            <input
              type={hiddenPassword ? "password" : "text"}
              id="newPassword"
              name="newPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.password}
              required
            />
            {hiddenPassword ? (
              <Eye
                className={styles.eye}
                onClick={(e) => setHiddenPassword(false)}
              />
            ) : (
              <EyeOff
                className={styles.eye}
                onClick={(e) => setHiddenPassword(true)}
              />
            )}
            {state?.errors?.newPassword && <i>{state?.errors?.newPassword}</i>}
          </div>
          <div className={styles.formGroup}>
            <label
              htmlFor="confirmPassword"
              className={styles.confirmPasswordLabel}
              data-active={confirmPassword.length > 0}
            >
              Confirmez le mot de passe
            </label>
            <input
              type={hiddenPassword ? "password" : "text"}
              id="confirmPassword"
              name="confirmPassword"
              className={styles.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {hiddenPassword ? (
              <Eye
                className={styles.eye}
                onClick={(e) => setHiddenPassword(false)}
              />
            ) : (
              <EyeOff
                className={styles.eye}
                onClick={(e) => setHiddenPassword(true)}
              />
            )}
            {state?.errors?.confirmPassword && (
              <i>{state?.errors?.confirmPassword}</i>
            )}
          </div>
          <input
            type="text"
            id="reset-code"
            name="reset-code"
            defaultValue={resetCode}
            hidden
          />
          <button type="submit" disabled={pending} data-disabled={pending}>
            Réinitialiser le mot de passe
          </button>
        </form>
      )}
      {state?.status === "success" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          Se connecter
        </button>
      )}
    </div>
  );
}
