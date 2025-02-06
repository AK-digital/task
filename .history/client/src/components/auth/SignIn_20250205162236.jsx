"use client";

import { signIn } from "@/actions/auth";
import styles from "@/styles/components/auth/signIn.module.css";
import { instrumentSans } from "@/utils/font";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SignIn({ setSignIn, setSignUp }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signIn, initialState);

  function handleSignUp(e) {
    e.preventDefault();
    setSignIn(false);
    setSignUp(true);
  }

  async function handleGoogleAuth(e) {
    e.preventDefault();
    window.open(`http://localhost:5000/api/auth/google/`, "_self");
  }

  useEffect(() => {
    if (state?.status === "success") {
      const invitationId = getCookie("invitationId");
      if (invitationId) {
        router.push(`invitation/${invitationId}`);
      } else {
        router.push("/project");
      }
    }
  }, [state]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Vous avez déjà un compte ?</span>
      </div>
      {(state?.errors?.password || state?.errors?.email) && (
        <div>
          <i data-error={true}>Identifiants incorrects, veuillez réessayer.</i>
        </div>
      )}
      <form className={styles.form} action={formAction}>
        <div>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            defaultValue={state?.payload?.email}
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Mot de passe"
            defaultValue={state?.payload?.password}
          />
          <span className={styles.forgotPassword}>Mot de passe oublié ?</span>
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
          <button
            className={`${instrumentSans.className} ${styles.google}`}
            onClick={handleGoogleAuth}
          >
            {" "}
            <span>
              <Image src={"/google.svg"} width={25} height={25} alt="Google" />
            </span>{" "}
            Se connecter avec Google
          </button>
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
