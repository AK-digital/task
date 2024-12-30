import styles from "@/styles/components/signIn.module.css"

export default function SignIn({ setSignIn, setSignUp }) {

    function handleSignUp(e) {
        e.preventDefault()
        setSignIn(false)
        setSignUp(true)
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <span>Vous avez déjà un compte ?</span>
            </div>
            <form action="">
                <div>
                    <label htmlFor="email">Adresse mail</label>
                    <input type="email" name="email" id="email" placeholder="Email" />
                </div>
                <div>
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name="password" id="password" placeholder="Mot de passe" />
                </div>
                {/* Buttons */}
                <div>
                    <button type="submit">Se connecter</button>
                    <button id="google">Se connecter avec Google</button>
                </div>
            </form>
            <div>
                <span onClick={handleSignUp}>Je n'ai pas encore de compte</span>
            </div>
        </div>
    )
}