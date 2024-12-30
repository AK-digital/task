import { signUp } from "@/actions/auth"
import styles from "@/styles/components/auth/signUp.module.css"
import { instrumentSans } from "@/utils/font"
import Image from "next/image"
import { useActionState } from "react"


const initialState = {
    status: 'pending',
    payload: null,
    message: '',
    errors: null
}

export default function SignUp({ setSignIn, setSignUp }) {
    const [state, formAction, pending] = useActionState(signUp, initialState)

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
            <form className={styles.form} action={formAction}>
                <input type="text" name="last-name" id="last-name" placeholder="Nom" defaultValue={state?.payload?.lastName} />
                {state?.errors?.lastName && (
                    <i>{state?.errors?.lastName}</i>
                )}
                <input type="text" name="first-name" id="first-name" placeholder="Prénom" defaultValue={state?.payload?.firstName} />
                {state?.errors?.firstName && (
                    <i>{state?.errors?.firstName}</i>
                )}
                <input type="email" name="email" id="email" placeholder="Email" defaultValue={state?.payload?.email} />
                {state?.errors?.email && (
                    <i>{state?.errors?.email}</i>
                )}
                <input type="password" name="password" id="password" placeholder="Mot de passe" defaultValue={state?.payload?.password} />
                {state?.errors?.password && (
                    <>
                        <div>

                            <i>Le mot de passe doit contenir</i>
                            <ul>
                                <li>Au moins 8 caractères</li>
                                <li>Une lettre majuscule (A-Z)</li>
                                <li>Un chiffre (0-9)</li>
                                <li>Un caractère spécial (!@#$%^&?)</li>
                            </ul>
                        </div>
                    </>
                )}
                {/* Buttons */}
                <div className={styles.buttons}>
                    <button type="submit" data-disabled={pending} className={instrumentSans.className} disabled={pending}>{pending ? "Inscription en cours..." : "S'inscrire"}</button>
                    <button className={`${instrumentSans.className} ${styles.google}`}> <span><Image src={"/google.svg"} width={25} height={25} alt="Google" /></span> S'inscrire avec Google</button>
                </div>
            </form>
            <div className={styles.text}>
                <p>Vous avez déjà un compte ? <span onClick={handleSignIn}>Se connecter</span></p>
            </div>
        </div>
    )
}