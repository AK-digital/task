"use client";
import { resetForgotPassword } from "@/actions/auth";
import styles from "@/styles/components/auth/sign.module.css";
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

export default function ResetForgotPasswordForm({ resetCode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const resetForgotPasswordWithT = (prevState, formData) =>
    resetForgotPassword(t, prevState, formData);
  const [state, formAction, pending] = useActionState(
    resetForgotPasswordWithT,
    initialState
  );

  useEffect(() => {
    setStatusMessage("");
    if (state?.status === "success") {
      setStatusMessage(t("auth.forgot_password.password_reset_success"));
    }
    if (
      state?.status === "failure" &&
      !state?.errors?.newPassword &&
      !state?.errors?.confirmPassword
    ) {
      setStatusMessage(t("auth.forgot_password.unexpected_error"));
    }
  }, [state, t]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {t("auth.forgot_password.reset_title")}
      </div>
      {statusMessage && (
        <div className={styles.messageStatus}>
          <span data-status={state?.status}>{statusMessage}</span>
        </div>
      )}
      {state?.status !== "success" && (
        <form className={styles.form} action={formAction}>
          <div className="form-group">
            <label
              htmlFor="newPassword"
              className={styles.passwordLabel}
              data-active={password.length > 0}
            >
              {t("auth.forgot_password.new_password")}
            </label>
            <input
              type={hiddenPassword ? "password" : "text"}
              id="newPassword"
              name="newPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.password}
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
            {state?.errors?.newPassword && (
              <i>{translateValidationErrors(state.errors.newPassword, t)}</i>
            )}
          </div>
          <div className="form-group">
            <label
              htmlFor="confirmPassword"
              className={styles.confirmPasswordLabel}
              data-active={confirmPassword.length > 0}
            >
              {t("auth.forgot_password.confirm_password")}
            </label>
            <input
              type={hiddenPassword ? "password" : "text"}
              id="confirmPassword"
              name="confirmPassword"
              className={styles.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {state?.errors?.confirmPassword && (
              <i>
                {translateValidationErrors(state.errors.confirmPassword, t)}
              </i>
            )}
          </div>
          <input
            type="text"
            id="reset-code"
            name="reset-code"
            defaultValue={resetCode}
            hidden
          />
          <button type="submit" disabled={pending} data-disabled={pending}>
            {t("auth.forgot_password.reset_password_button")}
          </button>
        </form>
      )}
      {state?.status === "success" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          {t("auth.forgot_password.login_button")}
        </button>
      )}
    </div>
  );
}
