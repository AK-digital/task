"use client"
import styles from "@/styles/pages/auth.module.css"
import SignIn from "@/components/auth/SignIn"
import SignUp from "@/components/auth/SignUp"
import { useState } from "react"
import Image from "next/image"

export default function Auth() {
    const [signIn, setSignIn] = useState(true)
    const [signUp, setSignUp] = useState(false)
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.left}>
                    {signIn && <SignIn setSignIn={setSignIn} setSignUp={setSignUp} />}
                    {signUp && <SignUp setSignIn={setSignIn} setSignUp={setSignUp} />}
                </div>
                {/* right background */}
                <div className={styles.right}>
                    <Image src={"/backgrounds/auth-bg.png"} width={120} height={120} alt="background" />
                </div>
            </div>
        </main>
    )
}