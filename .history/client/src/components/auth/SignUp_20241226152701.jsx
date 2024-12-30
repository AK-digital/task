import styles from "@/styles/components/auth/signUp.module.css"
import { instrumentSans } from "@/utils/font"
import Image from "next/image"

export default function SignUp({ setSignIn, setSignUp }) {
    function handleSignIn(e) {
        e.preventDefault()
        setSignUp(false)
        setSignIn(true)

    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <span>Vous n'avez pas de compte ?</span>
            </div>
            <form className={styles.form} action="">
                <input type="text" name="last-name" id="last-name" placeholder="Nom" />
                <input type="text" name="first-name" id="first-name" placeholder="Prénom" />
                <input type="email" name="email" id="email" placeholder="Email" />
                <input type="password" name="password" id="password" placeholder="Mot de passe" />
                {/* Buttons */}
                <div className={styles.buttons}>
                    <button type="submit" className={instrumentSans.className}>S'inscrire</button>
                    <button className={`${instrumentSans.className} ${styles.google}`}> <span><Image src={"/google.svg"} width={25} height={25} alt="Google" /></span> S'inscrire avec Google</button>
                </div>
            </form>
            <div className={styles.text}>
                <p>Vous avez déjà un compte ? <span onClick={handleSignIn}>Se connecter</span></p>
            </div>
        </div>
    )
}