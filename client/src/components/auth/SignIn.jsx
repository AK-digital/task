"use client";

import { signIn } from "@/actions/auth";
import { reSendVerificationEmail } from "@/api/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
  invitationId: null,
};

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);
  const [hiddenPassword, setHiddenPassword] = useState(true);

  const signInWithT = (prevState, formData) => signIn(prevState, formData, t);
  const [state, formAction, pending] = useActionState(
    signInWithT,
    initialState
  );

  function handleSignUp(e) {
    e.preventDefault();
    router.push("/sign-up");
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    router.push("/forgot-password");
  }

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
      setMessage(state?.message || t("auth.signin.connection_error"));
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
      setMessage(t("auth.signin.verification_success"));
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>{t("auth.signin.title")}</span>
      </div>
      {message && (
        <div className={styles.messageStatus}>
          <span data-status={status}>{message}</span>
          <button className={styles.resend} onClick={handleResendEmail}>
            {t("auth.signin.resend_email")}
          </button>
        </div>
      )}
      {(state?.errors?.password || state?.errors?.email) && (
        <div>
          <i data-error={true}>{t("auth.signin.incorrect_credentials")}</i>
        </div>
      )}
      <form className={styles.form} action={formAction}>
        <div className="form-group">
          <label
            htmlFor="email"
            className={styles.emailLabel}
            data-active={email ? true : false}
          >
            {t("auth.signin.email_label")}
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
            {t("auth.signin.password_label")}
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
          <a className={styles.forgotPassword} onClick={handleForgotPassword}>
            {t("auth.signin.forgot_password")}
          </a>
        </div>

        <div className={styles.buttons}>
          <button
            data-disabled={pending}
            type="submit"
            className={bricolageGrostesque.className}
            disabled={pending}
          >
            {pending
              ? t("auth.signin.submit_button_loading")
              : t("auth.signin.submit_button")}
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
          {t("auth.signin.no_account")}{" "}
          <span onClick={handleSignUp}>{t("auth.signin.signup_link")}</span>
        </p>
      </div>
    </div>
  );
}
