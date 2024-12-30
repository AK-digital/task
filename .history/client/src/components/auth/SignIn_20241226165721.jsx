import { signIn } from "@/actions/auth"
import styles from "@/styles/components/auth/signIn.module.css"
import { instrumentSans } from "@/utils/font"
import Image from "next/image"
import { useActionState } from "react"

export default function SignIn({ setSignIn, setSignUp }) {
    const [state, formAction, pending] = useActionState(signIn, initialState)

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
                {state?.errors?.password && (

                    <i>Le mot de passe doit contenir :</i>

                )}
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
                    <button data-disabled={pending} type="submit" className={instrumentSans.className} disabled={pending}>{pending ? "Connexion en cours..." : "Se connecter"}</button>
                    <button className={`${instrumentSans.className} ${styles.google}`}> <span><Image src={"/google.svg"} width={25} height={25} alt="Google" /></span> Se connecter avec Google</button>
                </div>
            </form>
            <div className={styles.text}>
                <p>Vous n'avez pas encore de compte ? <span onClick={handleSignUp}>S'inscrire</span></p>
            </div>
        </div>
    )
}