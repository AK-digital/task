import { resetForgotPassword } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function ResetForgotPasswordForm() {
  const [statusMessage, setStatusMessage] = useState("");
  const [state, formAction, pending] = useActionState(
    resetForgotPassword,
    initialState
  );

  return (
    <div className={styles.container}>
      <h1>Mot de passe oublié</h1>
      <form className={styles.form} action={formAction}>
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
        <button type="submit" disabled={pending} data-disabled={pending}>
          Réinitialiser le mot de passe
        </button>
      </form>
    </div>
  );
}
