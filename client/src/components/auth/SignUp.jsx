import { signUp } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { instrumentSans } from "@/utils/font";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SignUp({ setSignIn, setSignUp }) {
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [state, formAction, pending] = useActionState(signUp, initialState);

  function handleSignIn(e) {
    e.preventDefault();
    setSignUp(false);
    setSignIn(true);
  }

  //   async function handleGoogleAuth(e) {
  //     e.preventDefault();
  //     window.open(`http://localhost:5000/api/auth/google/`, "_self");
  //   }

  useEffect(() => {
    if (state?.status === "success") {
      setSignUp(false);
      setSignIn(true);
    }
  }, [state]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>Vous n'avez pas de compte ?</span>
      </div>
      <form className={styles.form} action={formAction}>
        <div className={styles.formGroup}>
          <label htmlFor="last-name">Nom</label>
          <input
            type="text"
            name="last-name"
            id="last-name"
            placeholder="Nom"
            autoComplete="last-name"
            defaultValue={state?.payload?.lastName}
            required
          />
          {state?.errors?.lastName && <i>{state?.errors?.lastName}</i>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="first-name">Prénom</label>
          <input
            type="text"
            name="first-name"
            id="first-name"
            placeholder="Prénom"
            autoComplete="first-name"
            defaultValue={state?.payload?.firstName}
            required
          />
          {state?.errors?.firstName && <i>{state?.errors?.firstName}</i>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Adresse mail</label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="Email"
            defaultValue={state?.payload?.email}
            required
          />
          {state?.errors?.email && <i>{state?.errors?.email}</i>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Mot de passe</label>
          <input
            type={hiddenPassword ? "password" : "text"}
            name="password"
            id="password"
            autoComplete="password"
            placeholder="Mot de passe"
            defaultValue={state?.payload?.password}
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
        </div>
        {/* Buttons */}
        <div className={styles.buttons}>
          <button
            type="submit"
            data-disabled={pending}
            className={instrumentSans.className}
            disabled={pending}
          >
            {pending ? "Inscription en cours..." : "S'inscrire"}
          </button>
          {/* <button
            className={`${instrumentSans.className} ${styles.google}`}
            onClick={handleGoogleAuth}
          >
            {" "}
            <span>
              <Image src={"/google.svg"} width={25} height={25} alt="Google" />
            </span>{" "}
            S'inscrire avec Google
          </button> */}
        </div>
      </form>
      <div className={styles.text}>
        <p>
          Vous avez déjà un compte ?{" "}
          <span onClick={handleSignIn}>Se connecter</span>
        </p>
      </div>
    </div>
  );
}
