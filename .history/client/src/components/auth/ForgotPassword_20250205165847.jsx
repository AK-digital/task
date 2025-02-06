export default function ForgotPassword() {
  return (
    <div>
      <div className={styles.title}>
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
        </div>
        <button type="submit">Soumettre</button>
      </form>
    </div>
  );
}
