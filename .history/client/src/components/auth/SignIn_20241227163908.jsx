import { signIn } from "@/actions/auth"
import styles from "@/styles/components/auth/signIn.module.css"
import { instrumentSans } from "@/utils/font"
import Image from "next/image"
import { useActionState } from "react"

const initialState = {
    status: 'pending',
    payload: null,
    message: '',
    errors: null
}

export default function SignIn({ setSignIn, setSignUp }) {
    const [state, formAction, pending] = useActionState(signIn, initialState)

    function handleSignUp(e) {
        e.preventDefault()
        setSignIn(false)
        setSignUp(true)
    }

    async function handleGoogleAuth(e) {
        e.preventDefault()
        window.open(`http://localhost:5000/api/auth/google/`, "_self");
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <span>Vous avez déjà un compte ?</span>
            </div>
            <form className={styles.form} action={formAction}>
                <input type="email" name="email" id="email" placeholder="Email" defaultValue={state?.payload?.email} />
                {state?.errors?.email && (
                    <i>{state?.errors?.email}</i>
                )}
                <input type="password" name="password" id="password" placeholder="Mot de passe" defaultValue={state?.payload?.password} />
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
                {state?.errors?.passwordErr && (
                    <i>{state?.errors?.passwordErr}</i>
                )}
                <div className={styles.buttons}>
                    <button data-disabled={pending} type="submit" className={instrumentSans.className} disabled={pending}>{pending ? "Connexion en cours..." : "Se connecter"}</button>
                    <button className={`${instrumentSans.className} ${styles.google}`} onClick={handleGoogleAuth}> <span><Image src={"/google.svg"} width={25} height={25} alt="Google" /></span> Se connecter avec Google</button>
                </div>
            </form>
            <div className={styles.text}>
                <p>Vous n'avez pas encore de compte ? <span onClick={handleSignUp}>S'inscrire</span></p>
            </div>
        </div>
    )
}