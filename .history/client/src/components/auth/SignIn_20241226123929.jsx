export default function SignIn() {
    return (
        <div>
            <div>
                <span>Vous avez déjà un compte ?</span>
            </div>
            <form action="">
                <div>
                    <label htmlFor="email">Adresse mail</label>
                    <input type="email" name="email" id="email" />
                </div>
                <div>
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name="password" id="password" />
                </div>
                {/* Buttons */}
                <div>
                    <button type="submit">Se connecter</button>
                </div>
            </form>
            <div>
                <span>Je n'ai pas encore de compte</span>
            </div>
        </div>
    )
}