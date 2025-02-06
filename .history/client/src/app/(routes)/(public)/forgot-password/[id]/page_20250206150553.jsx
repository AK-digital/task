"use client";
import { resetForgotPassword } from "@/actions/auth";
import pageStyles from "@/styles/pages/auth.module.css";
import styles from "@/styles/components/auth/sign.module.css";
import { useParams } from "next/navigation";
import { useActionState } from "react";
import ResetForgotPasswordForm from "@/components/auth/ResetForgotPasswordForm";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};
export default function ForgotPassword() {
  const params = useParams();
  const { id } = params;
  const resetCode = id;
  const [state, formAction, pending] = useActionState(
    resetForgotPassword,
    initialState
  );

  console.log(state);

  return (
    <main className={pageStyles.main}>
      <div className={pageStyles.container}>
        <ResetForgotPasswordForm />
      </div>
    </main>
  );
}
