"use client";

import { signIn } from "@/actions/auth";
import { reSendVerificationEmail } from "@/api/auth";
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

  const signInWithT = (prevState, formData) => signIn(t, prevState, formData);
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
    if (state?.message === t("auth.account_not_verified")) {
      setStatus("failure");
    }
  }, [state, t]);

  async function handleResendEmail() {
    const res = await reSendVerificationEmail(state?.payload?.email);

    if (res?.success) {
      setStatus("success");
      setMessage(t("auth.signin.verification_success"));
    }
  }

  return (
    <div className="flex flex-col w-full p-10 max-w-115 shadow-[0_0_40px_0] shadow-[#121e1f34] rounded-2xl text-left bg-[image:var(--background-gradient-dark)]">
      <div className="text-[1.9rem] font-bold mb-15">
        <span>{t("auth.signin.title")}</span>
      </div>
      {message && (
        <div className="text-center mb-6">
          <span
            data-status={status}
            className="data-[status=success]:text-accent-color data-[status=failure]:text-state-blocked-color"
          >
            {message}
          </span>
          <button
            className="bg-transparent text-accent-color text-small"
            onClick={handleResendEmail}
          >
            {t("auth.signin.resend_email")}
          </button>
        </div>
      )}
      {(state?.errors?.password || state?.errors?.email) && (
        <div>
          <i data-error={true}>{t("auth.signin.incorrect_credentials")}</i>
        </div>
      )}
      <form action={formAction} className="flex items-center flex-col gap-8">
        <div className="form-group">
          <label
            htmlFor="email"
            data-active={email ? true : false}
            className="text-text-lighter-color"
          >
            {t("auth.signin.email_label")}
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-b border-b-text-lighter-color text-text-lighter-color text-medium"
          />
        </div>
        <div className="form-group">
          <label
            htmlFor="password"
            data-active={password ? true : false}
            className="text-text-lighter-color"
          >
            {t("auth.signin.password_label")}
          </label>
          <input
            type={hiddenPassword ? "password" : "text"}
            name="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-b border-b-text-lighter-color text-text-lighter-color text-medium pr-10"
          />
          {hiddenPassword ? (
            <Eye
              onClick={(e) => setHiddenPassword(false)}
              className="absolute right-5 top-[11px] w-5 cursor-pointer text-text-lighter-color"
            />
          ) : (
            <EyeOff
              onClick={(e) => setHiddenPassword(true)}
              className="absolute right-5 top-[11px] w-5 cursor-pointer text-text-lighter-color"
            />
          )}
          <a
            onClick={handleForgotPassword}
            className="float-right mt-3 text-small"
          >
            {t("auth.signin.forgot_password")}
          </a>
        </div>

        <div className="ml-auto">
          <button data-disabled={pending} type="submit" disabled={pending}>
            {pending
              ? t("auth.signin.submit_button_loading")
              : t("auth.signin.submit_button")}
          </button>
          {/* <button onClick={handleGoogleAuth} className={`${instrumentSans.className} relative bg-[#3184FC] text-text-lighter-color hover:transition-all hover:duration-[120ms] hover:ease-linear`}>
            {" "}
            <span className="absolute flex justify-center items-center left-0.5 top-[1px] bg-text-lighter-color rounded-sm w-[34px] h-[34px] scale-90">
              <Image src={"/google.svg"} width={25} height={25} alt="Google" />
            </span>{" "}
            Se connecter avec Google
          </button> */}
        </div>
      </form>

      <div className="text-center text-text-color mt-15 font-light">
        <p>
          {t("auth.signin.no_account")}{" "}
          <span
            onClick={handleSignUp}
            className="text-accent-color-light cursor-pointer ml-1 hover:underline"
          >
            {t("auth.signin.signup_link")}
          </span>
        </p>
      </div>
    </div>
  );
}
