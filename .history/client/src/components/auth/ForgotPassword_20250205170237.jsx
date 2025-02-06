import styles from "@/styles/components/auth/signIn.module.css";
const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function ForgotPassword() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div>
      <div className={styles.title}>
        <span>Vous avez oublié votre mot de passe ?</span>
      </div>
      <form>
        <div>
          <label htmlFor="email">Email :</label>
          <input type="email" id="email" placeholder="Email" required />
          {state?.errors?.email && (
            <i data-error={true}>Email incorrect, veuillez réessayer.</i>
          )}
        </div>
        <button type="submit">Soumettre</button>
      </form>
      <div className={styles.text}>
        <p>
          Vous vous souvenez de votre mot de passe ? <span>Se connecter</span>
        </p>
      </div>
    </div>
  );
}
