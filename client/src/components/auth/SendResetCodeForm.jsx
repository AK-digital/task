import { sendResetCode } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
import { bricolageGrostesque, instrumentSans } from "@/utils/font";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function SendResetCodeForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [state, formAction, pending] = useActionState(
    sendResetCode,
    initialState
  );

  useEffect(() => {
    setMessageStatus("");
    if (state?.status === "success") {
      setMessageStatus(t("auth.forgot_password.reset_email_sent"));
    }

    if (state?.status === "failure" && !state?.errors?.email) {
      setMessageStatus(t("auth.forgot_password.unexpected_error"));
    }
  }, [state, t]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t("auth.forgot_password.title")}</div>
      {messageStatus && (
        <div className={styles.messageStatus}>
          <span data-status={state?.status}>{messageStatus}</span>
        </div>
      )}
      <form className={styles.form} action={formAction}>
        <div className="form-group">
          <label
            htmlFor="email"
            className={styles.emailLabel}
            data-active={email.length > 0}
          >
            {t("auth.forgot_password.email_label")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.email}
            required
          />
          {state?.errors?.email && (
            <div className={styles.emailErr}>
              <i data-error={true}>{state?.errors?.email}</i>
            </div>
          )}
        </div>
        <div className={styles.buttons}>
          <button
            type="submit"
            className={bricolageGrostesque.className}
            data-disabled={pending}
            disabled={pending}
          >
            {t("auth.forgot_password.reset_password_button")}
          </button>
        </div>
      </form>
      <div className={styles.text}>
        <p>
          <span
            onClick={(e) => {
              router.push("/");
            }}
          >
            {t("auth.forgot_password.back_to_login")}
          </span>
        </p>
      </div>
    </div>
  );
}
