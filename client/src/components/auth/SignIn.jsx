"use client";

import { signIn } from "@/actions/auth";
import { reSendVerificationEmail } from "@/api/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { ArrowRightCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { set } from "zod";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
  invitationId: null,
};

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [state, formAction, pending] = useActionState(signIn, initialState);

  function handleSignUp(e) {
    e.preventDefault();
    router.push("/sign-up");
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    router.push("/forgot-password");
  }
  // async function handleGoogleAuth(e) {
  //   e.preventDefault();
  //   window.open(`http://localhost:5000/api/auth/google/`, "_self");
  // }

  useEffect(() => {
    setMessage("");
    if (state?.status === "success") {
      if (state?.invitationId) {
        router.push(`invitation/${state?.invitationId}`);
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

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Connexion</span>
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
        <div className="form-group">
          <label
            htmlFor="email"
            className={styles.emailLabel}
            data-active={email ? true : false}
          >
            Adresse e-mail
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className={`${styles.email} ${bricolageGrostesque.className}`}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label
            htmlFor="password"
            className={styles.passwordLabel}
            data-active={password ? true : false}
          >
            Mot de passe
          </label>
          <input
            type={hiddenPassword ? "password" : "text"}
            name="password"
            id="password"
            autoComplete="current-password"
            className={styles.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
          <a
            className={styles.forgotPassword}
            onClick={handleForgotPassword}
          >
            Mot de passe oublié ?
          </a>
        </div>

        <div className={styles.buttons}>
          <button
            data-disabled={pending}
            type="submit"
            className={bricolageGrostesque.className}
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
