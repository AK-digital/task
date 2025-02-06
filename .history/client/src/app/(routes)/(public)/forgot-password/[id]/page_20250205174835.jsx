"use client";
import styles from "@/styles/components/auth/signIn.module.css";
import { useParams } from "next/navigation";
const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};
export default function ForgotPassword() {
  const params = useParams();
  const { id } = params;
  const resetCode = id;
  const [state,formAction, pending]

  return (
    <main>
      <div className={styles.container}>
        <h1>Mot de passe oublié</h1>
        <form className={styles.form}>
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
