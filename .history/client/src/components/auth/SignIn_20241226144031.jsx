import styles from "@/styles/components/signIn.module.css"
import { instrumentSans } from "@/utils/font"

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
            <form className={styles.form} action="">
                <input type="email" name="email" id="email" placeholder="Email" />
                <input type="password" name="password" id="password" placeholder="Mot de passe" />
                {/* Buttons */}
                <div className={styles.buttons}>
                    <button type="submit" className={instrumentSans.className}>Se connecter</button>
                    <button className={instrumentSans.className} id="google">Se connecter avec Google</button>
                </div>
            </form>
            <div className={styles.}>
                <p>Vous n'avez pas encore de compte ? <span onClick={handleSignUp}>S'inscrire</span></p>
            </div>
        </div>
    )
}