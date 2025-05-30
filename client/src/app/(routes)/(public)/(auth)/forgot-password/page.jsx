"use client";
import SendResetCodeForm from "@/components/auth/SendResetCodeForm";

export default function ForgotPassword() {
  return (
    <div className="flex justify-center items-center flex-col w-full h-full gap-6">
      <SendResetCodeForm />
    </div>
  );
}
