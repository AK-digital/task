import { signUp } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SignUp() {
  const router = useRouter();
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [message, setMessage] = useState(null);
  const [state, formAction, pending] = useActionState(signUp, initialState);

  function handleSignIn(e) {
    e.preventDefault();
    router.push("/");
  }

  useEffect(() => {
    setMessage("");
    if (state?.status === "failure" && state?.errors === null) {
      setMessage(
        state?.message ||
          "Une erreur s'est produite lors de la création de votre compte. Veuillez réessayer."
      );
    }
  }, [state]);

  return (
    <div className={styles.container}>
      {state?.status === "success" ? (
        <div className={styles.accountCreated}>
          <span>Votre compte a été créé avec succès !</span>
          <p>
            Un email de vérification a été envoyé à votre adresse e-mail.
            Veuillez cliquer sur le lien dans l'email pour activer votre compte.
          </p>
          <button type="button" onClick={handleSignIn}>
            Retourner à la page de connexion
          </button>
        </div>
      ) : (
        <>
          <div className={styles.title}>
            <span>Inscription</span>
          </div>
          {message && (
            <div className={styles.messageStatus}>
              <span data-status={state?.status}>{message}</span>
            </div>
          )}
          <form className={styles.form} action={formAction}>
            <div className="form-group">
              <label
                htmlFor="last-name"
                className={styles.lastNameLabel}
                data-active={lastName.length > 0}
              >
                Nom
              </label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                autoComplete="last-name"
                className={`${styles.lastName} ${bricolageGrostesque.className}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              {state?.errors?.lastName && <i>{state?.errors?.lastName}</i>}
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className={styles.firstNameLabel}
                data-active={firstName.length > 0}
              >
                Prénom
              </label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                autoComplete="first-name"
                className={`${styles.firstName} ${bricolageGrostesque.className}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              {state?.errors?.firstName && <i>{state?.errors?.firstName}</i>}
            </div>
            <div className="form-group">
              <label
                htmlFor="email"
                className={styles.emailLabel}
                data-active={email.length > 0}
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
              {state?.errors?.email && <i>{state?.errors?.email}</i>}
            </div>
            <div className="form-group">
              <label
                htmlFor="password"
                className={styles.passwordLabel}
                data-active={password.length > 0}
              >
                Mot de passe
              </label>
              <input
                type={hiddenPassword ? "password" : "text"}
                name="password"
                id="password"
                autoComplete="password"
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
              {state?.errors?.password && (
                <div className={styles.passwordErr}>
                  <i>Le mot de passe doit contenir :</i>
                  <ul>
                    <li>- Au moins 8 caractères</li>
                    <li>- Une lettre majuscule (A-Z)</li>
                    <li>- Un chiffre (0-9)</li>
                    <li>- Un caractère spécial (!@#$%^&?)</li>
                  </ul>
                </div>
              )}
            </div>
            {/* Buttons */}
            <div className={styles.buttons}>
              <button
                type="submit"
                data-disabled={pending}
                className={bricolageGrostesque.className}
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
        </>
      )}
    </div>
  );
}
