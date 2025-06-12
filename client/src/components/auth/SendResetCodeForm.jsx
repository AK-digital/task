import { sendResetCode } from "@/actions/auth";
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

  const sendResetCodeWithT = (prevState, formData) =>
    sendResetCode(t, prevState, formData);
  const [state, formAction, pending] = useActionState(
    sendResetCodeWithT,
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
    <div className="flex flex-col w-full p-10 max-w-115 shadow-[0_0_40px_0] shadow-[#121e1f34] rounded-2xl text-left bg-[image:var(--background-gradient-dark)]">
      <div className="text-[1.9rem] font-bold mb-15">
        {t("auth.forgot_password.title")}
      </div>
      {messageStatus && (
        <div className="text-center mb-6">
          <span data-status={state?.status}>{messageStatus}</span>
        </div>
      )}
      <form action={formAction} className="flex items-center flex-col gap-8">
        <div className="form-group">
          <label
            htmlFor="email"
            data-active={email.length > 0}
            className="text-text-lighter-color"
          >
            {t("auth.forgot_password.email_label")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-b border-b-text-lighter-color text-text-lighter-color text-medium"
          />

          {state?.errors?.email && (
            <div className="mt-1 text-left ml-1">
              <i data-error={true}>{state?.errors?.email}</i>
            </div>
          )}
        </div>
        <div className="ml-auto">
          <button
            type="submit"
            className="font-bricolage"
            data-disabled={pending}
            disabled={pending}
          >
            {t("auth.forgot_password.reset_password_button")}
          </button>
        </div>
      </form>
      <div className="text-center text-text-color mt-15 font-light">
        <p>
          <span
            onClick={(e) => {
              router.push("/");
            }}
            className="text-accent-color-light cursor-pointer ml-1 hover:underline"
          >
            {t("auth.forgot_password.back_to_login")}
          </span>
        </p>
      </div>
    </div>
  );
}
