"use server";
import ResetForgotPasswordForm from "@/components/auth/ResetForgotPasswordForm";

export default async function ForgotPassword({ params }) {
  const { id } = await params;

  return (
    <div className="flex justify-center items-center flex-col w-full h-full gap-6">
      <ResetForgotPasswordForm resetCode={id} />
    </div>
  );
}
