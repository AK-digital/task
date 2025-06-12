import { signUp } from "@/actions/auth";
import { Eye, EyeOff } from "lucide-react";
import { translateCustomErrors } from "@/utils/zod";
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

  // Fonction wrapper pour passer t à signUp
  const signUpWithT = (prevState, formData) => signUp(t, prevState, formData);

  const [state, formAction, pending] = useActionState(
    signUpWithT,
    initialState
  );

  function handleSignIn(e) {
    e.preventDefault();
    router.push("/");
  }

  useEffect(() => {
    setMessage("");
    if (state?.status === "failure" && state?.errors === null) {
      setMessage(state?.message || t("auth.signup.account_creation_error"));
    }
  }, [state]);

  return (
    <div className="flex flex-col w-full p-10 shadow-[0_0_40px_0] shadow-[#121e1f34] rounded-2xl text-left bg-[image:var(--background-gradient-dark)] max-w-125">
      {state?.status === "success" ? (
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold">
            {t("auth.signup.account_created_title")}
          </span>
          <p>{t("auth.signup.account_created_message")}</p>
          <button type="button" onClick={handleSignIn} className="mt-2">
            {t("auth.signup.back_to_signin")}
          </button>
        </div>
      ) : (
        <>
          <div className="text-[1.9rem] font-bold mb-15">
            <span>{t("auth.signup.title")}</span>
          </div>
          {message && (
            <div className="text-center mb-6">
              <span
                data-status={state?.status}
                className="data-[status=success]:text-accent-color data-[status=failure]:text-state-blocked-color"
              >
                {message}
              </span>
            </div>
          )}
          <form
            action={formAction}
            className="flex items-center flex-col gap-8"
          >
            <div className="form-group">
              <label
                htmlFor="last-name"
                data-active={lastName.length > 0}
                className="text-text-lighter-color"
              >
                {t("auth.signup.lastname_label")}
              </label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                autoComplete="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="border-b border-b-text-lighter-color text-text-lighter-color text-medium font-bricolage"
              />
              {state?.errors?.lastName && (
                <i>{translateCustomErrors(state.errors.lastName, t)}</i>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                data-active={firstName.length > 0}
                className="text-text-lighter-color"
              >
                {t("auth.signup.firstname_label")}
              </label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                autoComplete="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="border-b border-b-text-lighter-color text-text-lighter-color text-medium font-bricolage"
              />
              {state?.errors?.firstName && (
                <i>{translateCustomErrors(state.errors.firstName, t)}</i>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="email"
                data-active={email.length > 0}
                className="text-text-lighter-color"
              >
                {t("auth.signup.email_label")}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-b border-b-text-lighter-color text-text-lighter-color text-medium font-bricolage"
              />
              {state?.errors?.email && (
                <i>{translateCustomErrors(state.errors.email, t)}</i>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="password"
                data-active={password.length > 0}
                className="text-text-lighter-color"
              >
                {t("auth.signup.password_label")}
              </label>
              <input
                type={hiddenPassword ? "password" : "text"}
                name="password"
                id="password"
                autoComplete="password"
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
              {state?.errors?.password && (
                <div className="text-left text-[#DC3545] italic text-sm">
                  <i className="block mt-1">
                    {t("auth.signup.password_requirements")}
                  </i>
                  <ul className="ml-6 mt-[5px]">
                    <li>{t("auth.signup.password_min_chars")}</li>
                    <li>{t("auth.signup.password_uppercase")}</li>
                    <li>{t("auth.signup.password_number")}</li>
                    <li>{t("auth.signup.password_special")}</li>
                  </ul>
                </div>
              )}
            </div>
            {/* Buttons */}
            <div className="ml-auto">
              <button
                type="submit"
                data-disabled={pending}
                disabled={pending}
                className="font-bricolage"
              >
                {pending
                  ? t("auth.signup.submit_button_loading")
                  : t("auth.signup.submit_button")}
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
              {t("auth.signup.have_account")}{" "}
              <span
                onClick={handleSignIn}
                className="text-accent-color-light cursor-pointer ml-1 hover:underline"
              >
                {t("auth.signup.signin_link")}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
