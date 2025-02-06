"use client";
import styles from "@/styles/pages/auth.module.css";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import { useState } from "react";
import ForgotPassword from "@/components/auth/ForgotPassword";

export default function Auth() {
  const [forgotPassword, setForgotPassword] = useState(false);
  const [signIn, setSignIn] = useState(true);
  const [signUp, setSignUp] = useState(false);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {signIn && (
          <SignIn
            setSignIn={setSignIn}
            setSignUp={setSignUp}
            setForgotPassword={setForgotPassword}
          />
        )}
        {signUp && <SignUp setSignIn={setSignIn} setSignUp={setSignUp} />}
        {forgotPassword && (
          <ForgotPassword
            setForgotPassword={setForgotPassword}
            setSignIn={setSignIn}
          />
        )}
      </div>
    </main>
  );
}
