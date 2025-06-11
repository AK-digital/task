"use client";
import { resetForgotPassword } from "@/actions/auth";
import { Eye, EyeOff } from "lucide-react";
import { translateValidationErrors } from "@/utils/zod";
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
    <div className="flex flex-col w-full p-10 shadow-[0_0_40px_0] shadow-[#121e1f34] rounded-2xl text-left bg-[image:var(--background-gradient-dark)] max-w-125">
      <div className="text-[1.9rem] font-bold mb-15">
        {t("auth.forgot_password.reset_title")}
      </div>
      {statusMessage && (
        <div className="text-center mb-6">
          <span data-status={state?.status} className="data-[status=success]:text-accent-color data-[status=failure]:text-state-blocked-color">{statusMessage}</span>
        </div>
      )}
      {state?.status !== "success" && (
        <form action={formAction} className="flex items-center flex-col gap-8">
          <div className="form-group">
            <label
              htmlFor="newPassword"
              data-active={password.length > 0}
              className="text-text-lighter-color"
            >
              {t("auth.forgot_password.new_password")}
            </label>
            <input
              type={hiddenPassword ? "password" : "text"}
              id="newPassword"
              name="newPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-b border-b-text-lighter-color text-text-lighter-color text-medium"
            />
            {hiddenPassword ? (
              <Eye
                onClick={(e) => setHiddenPassword(false)}
                className="absolute right-5 top-[11px] w-5 cursor-pointer text-text-lighter-color" />
            ) : (
              <EyeOff
                onClick={(e) => setHiddenPassword(true)}
                className="absolute right-5 top-[11px] w-5 cursor-pointer text-text-lighter-color" />
            )}
            {state?.errors?.newPassword && (
              <i>{translateValidationErrors(state.errors.newPassword, t)}</i>
            )}
          </div>
          <div className="form-group">
            <label
              htmlFor="confirmPassword"
              data-active={confirmPassword.length > 0}
              className="text-text-lighter-color"
            >
              {t("auth.forgot_password.confirm_password")}
            </label>
            <input
              type={hiddenPassword ? "password" : "text"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-b border-b-text-lighter-color text-text-lighter-color text-medium"
            />
            {hiddenPassword ? (
              <Eye
              onClick={(e) => setHiddenPassword(false)}
              className="absolute right-5 top-[11px] w-5 cursor-pointer text-text-lighter-color" />
            ) : (
              <EyeOff
              onClick={(e) => setHiddenPassword(true)}
              className="absolute right-5 top-[11px] w-5 cursor-pointer text-text-lighter-color" />
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
            className="border-b border-b-text-lighter-color text-text-lighter-color text-medium"
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
