"use client"

import SignIn from "@/components/auth/SignIn"
import SignUp from "@/components/auth/SignUp"
import { useState } from "react"

export default function Auth() {
    const [signIn, setSignIn] = useState(true)
    const [signUp, setSignUp] = useState(false)
    return (
        <main>
            <div>
                {signIn && <SignIn />}
                {signUp && <SignUp />}
            </div>
        </main>
    )
}