import styles from "@/styles/components/auth/signIn.module.css"
import { instrumentSans } from "@/utils/font"
import Image from "next/image"

export default function SignIn({ setSignIn, setSignUp }) {
    const [state, formAction, pending] = useActionState(signUp, initialState)

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
                {state?.errors?.password && (
                    <div className={styles.passwordErr}>
                        <i>Le mot de passe doit contenir :</i>
                        <ul>
                            <li>Au moins 8 caractères</li>
                            <li>Une lettre majuscule (A-Z)</li>
                            <li>Un chiffre (0-9)</li>
                            <li>Un caractère spécial (!@#$%^&?)</li>
                        </ul>
                    </div>
                )}
                {/* Buttons */}
                <div className={styles.buttons}>
                    <button type="submit" className={instrumentSans.className}>Se connecter</button>
                    <button className={`${instrumentSans.className} ${styles.google}`}> <span><Image src={"/google.svg"} width={25} height={25} alt="Google" /></span> Se connecter avec Google</button>
                </div>
            </form>
            <div className={styles.text}>
                <p>Vous n'avez pas encore de compte ? <span onClick={handleSignUp}>S'inscrire</span></p>
            </div>
        </div>
    )
}