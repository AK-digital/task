"use client";
import SignIn from "@/components/auth/SignIn";

export default function Auth() {
  return (
    <div className="flex justify-center items-center flex-col w-full h-full gap-6">
      <SignIn />
    </div>
  );
}
