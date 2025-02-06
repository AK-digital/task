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
      <div>
        <span>Vous avez oublié votre mot de passe ?</span>
      </div>
      <form>
        <div>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i data-error={true}>Identifiants incorrects, veuillez réessayer.</i>
        </div>
        <button type="submit">Soumettre</button>
      </form>
      <div className={styles.text}>
        <p>
          Vous n'avez pas encore de compte ?{" "}
          <span onClick={handleSignUp}>S'inscrire</span>
        </p>
      </div>
    </div>
  );
}
