"use server";
import pageStyles from "@/styles/pages/auth.module.css";
import { useParams } from "next/navigation";

import ResetForgotPasswordForm from "@/components/auth/ResetForgotPasswordForm";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};
export default async function ForgotPassword({ params }) {
  const { id } = await params;

  return (
    <main className={pageStyles.main}>
      <div className={pageStyles.container}>
        <ResetForgotPasswordForm resetCode={resetCode} />
      </div>
    </main>
  );
}
