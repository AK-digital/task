"use server";
import styles from "@/styles/pages/auth.module.css";
import ResetForgotPasswordForm from "@/components/auth/ResetForgotPasswordForm";

export default async function ForgotPassword({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ResetForgotPasswordForm resetCode={id} />
      </div>
    </main>
  );
}
