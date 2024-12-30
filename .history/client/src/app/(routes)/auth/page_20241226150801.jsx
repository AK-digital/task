"use client"
import styles from "@/styles/pages/auth.module.css"
import SignIn from "@/components/auth/SignIn"
import SignUp from "@/components/auth/SignUp"
import { useState } from "react"

export default function Auth() {
    const [signIn, setSignIn] = useState(true)
    const [signUp, setSignUp] = useState(false)
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div>
                    {signIn && <SignIn setSignIn={setSignIn} setSignUp={setSignUp} />}
                    {signUp && <SignUp setSignIn={setSignIn} setSignUp={setSignUp} />}
                </div>
                <div></div>
            </div>
        </main>
    )
}