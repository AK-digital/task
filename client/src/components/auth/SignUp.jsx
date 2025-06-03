import { signUp } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { translateValidationErrors } from "@/utils/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SignUp() {
  const { t } = useTranslation();
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
          <span>{t("auth.signup.account_created_title")}</span>
          <p>{t("auth.signup.account_created_message")}</p>
          <button type="button" onClick={handleSignIn}>
            {t("auth.signup.back_to_signin")}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.title}>
            <span>{t("auth.signup.title")}</span>
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
                {t("auth.signup.lastname_label")}
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
              {state?.errors?.lastName && (
                <i>{translateValidationErrors(state.errors.lastName, t)}</i>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className={styles.firstNameLabel}
                data-active={firstName.length > 0}
              >
                {t("auth.signup.firstname_label")}
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
              {state?.errors?.firstName && (
                <i>{translateValidationErrors(state.errors.firstName, t)}</i>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="email"
                className={styles.emailLabel}
                data-active={email.length > 0}
              >
                {t("auth.signup.email_label")}
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
              {state?.errors?.email && (
                <i>{translateValidationErrors(state.errors.email, t)}</i>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="password"
                className={styles.passwordLabel}
                data-active={password.length > 0}
              >
                {t("auth.signup.password_label")}
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
                  <i>{t("auth.signup.password_requirements")}</i>
                  <ul>
                    <li>{t("auth.signup.password_min_chars")}</li>
                    <li>{t("auth.signup.password_uppercase")}</li>
                    <li>{t("auth.signup.password_number")}</li>
                    <li>{t("auth.signup.password_special")}</li>
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
                {pending
                  ? t("auth.signup.submit_button_loading")
                  : t("auth.signup.submit_button")}
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
              {t("auth.signup.have_account")}{" "}
              <span onClick={handleSignIn}>{t("auth.signup.signin_link")}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
