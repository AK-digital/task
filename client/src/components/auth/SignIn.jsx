"use client";

import { signIn } from "@/actions/auth";
import { reSendVerificationEmail } from "@/api/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { instrumentSans } from "@/utils/font";
import { getCookie } from "cookies-next";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SignIn({ setSignIn, setSignUp, setForgotPassword }) {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);
  const [unVerified, setUnVerified] = useState(false);
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [state, formAction, pending] = useActionState(signIn, initialState);

  function handleSignUp(e) {
    e.preventDefault();
    setSignIn(false);
    setSignUp(true);
  }

  // async function handleGoogleAuth(e) {
  //   e.preventDefault();
  //   window.open(`http://localhost:5000/api/auth/google/`, "_self");
  // }

  useEffect(() => {
    setMessage("");
    setUnVerified(false);
    if (state?.status === "success") {
      const invitationId = getCookie("invitationId");
      if (invitationId) {
        router.push(`invitation/${invitationId}`);
      } else {
        router.push("/projects");
      }
      setStatus("success");
    }
    if (state?.status === "failure" && state?.errors === null) {
      setMessage(
        state?.message ||
          "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
      );
      setStatus("failure");
    }
    if (state?.message.includes("vérifié")) {
      setUnVerified(true);
      setStatus("failure");
    }
  }, [state]);

  async function handleResendEmail() {
    const res = await reSendVerificationEmail(state?.payload?.email);

    if (res?.success) {
      setStatus("success");
      setMessage("Email de vérification renvoyé avec succès.");
    }
  }

  console.log(state);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Vous avez déjà un compte ?</span>
      </div>
      {message && (
        <div className={styles.messageStatus}>
          <span data-status={status}>{message}</span>
          <button className={styles.resend} onClick={handleResendEmail}>
            Renvoyer un email de vérification
          </button>
        </div>
      )}
      {(state?.errors?.password || state?.errors?.email) && (
        <div>
          <i data-error={true}>Identifiants incorrects, veuillez réessayer.</i>
        </div>
      )}
      <form className={styles.form} action={formAction}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Adresse mail</label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="Email"
            defaultValue={state?.payload?.email}
          />
        </div>
        <div className={styles.password}>
          <label htmlFor="password">Mot de passe</label>
          <input
            type={hiddenPassword ? "password" : "text"}
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="Mot de passe"
            defaultValue={state?.payload?.password}
          />
          {hiddenPassword ? (
            <Eye
              className={styles.eye}
              onClick={(e) => setHiddenPassword(false)}
            />
          ) : (
            <EyeOff
              className={styles.eye}
              onClick={(e) => setHiddenPassword(true)}
            />
          )}
          <span
            className={styles.forgotPassword}
            onClick={(e) => {
              setSignIn(false);
              setForgotPassword(true);
            }}
          >
            Mot de passe oublié ?
          </span>
        </div>

        <div className={styles.buttons}>
          <button
            data-disabled={pending}
            type="submit"
            className={instrumentSans.className}
            disabled={pending}
          >
            {pending ? "Connexion en cours..." : "Se connecter"}
          </button>
          {/* <button
            className={`${instrumentSans.className} ${styles.google}`}
            onClick={handleGoogleAuth}
            >
            {" "}
            <span>
            <Image src={"/google.svg"} width={25} height={25} alt="Google" />
            </span>{" "}
            Se connecter avec Google
            </button> */}
        </div>
      </form>

      <div className={styles.text}>
        <p>
          Vous n'avez pas encore de compte ?{" "}
          <span onClick={handleSignUp}>S'inscrire</span>
        </p>
      </div>
    </div>
  );
}
