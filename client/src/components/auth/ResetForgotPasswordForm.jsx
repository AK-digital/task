"use client";
import { resetForgotPassword } from "@/actions/auth";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function ResetForgotPasswordForm({ resetCode }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hiddenPassword, setHiddenPassword] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [state, formAction, pending] = useActionState(
    resetForgotPassword,
    initialState
  );

  useEffect(() => {
    setStatusMessage("");
    if (state?.status === "success") {
      setStatusMessage("Mot de passe réinitialisé avec succès");
    }
    if (
      state?.status === "failure" &&
      !state?.errors?.newPassword &&
      !state?.errors?.confirmPassword
    ) {
      setStatusMessage("Une erreur inattendue s'est produite");
    }
  }, [state]);

  return (
    <div className="flex flex-col w-full p-10 shadow-[0_0_40px_0] shadow-[#121e1f34] rounded-2xl text-left bg-[image:var(--background-gradient-dark)] max-w-125">
      <div className="text-[1.9rem] font-bold mb-15">
        Réinitialisation de votre mot de passe ?
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
              Nouveau mot de passe
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
            {state?.errors?.newPassword && <i>{state?.errors?.newPassword}</i>}
          </div>
          <div className="form-group">
            <label
              htmlFor="confirmPassword"
              data-active={confirmPassword.length > 0}
              className="text-text-lighter-color"
            >
              Confirmez le mot de passe
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
              <i className="block mt-1">{state?.errors?.confirmPassword}</i>
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
            Réinitialiser le mot de passe
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
          Se connecter
        </button>
      )}
    </div>
  );
}
