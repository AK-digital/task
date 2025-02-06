"use client";
import { resetForgotPassword } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function ResetForgotPasswordForm({ resetCode }) {
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
      <h1>Réinitialisation de votre mot de passe ?</h1>
      {statusMessage && (
        <div className={styles.messageStatus}>
          <span data-status={state?.status}>{statusMessage}</span>
        </div>
      )}
      <form className={styles.form} action={formAction}>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword">Nouveau mot de passe</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="Mot de passe"
            required
          />
          {state?.errors?.newPassword && <i>{state?.errors?.newPassword}</i>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Mot de passe"
            required
          />
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
        {!state?.status === "success" && (
          <button type="submit" disabled={pending} data-disabled={pending}>
            Réinitialiser le mot de passe
          </button>
        )}
      </form>
    </div>
  );
}
