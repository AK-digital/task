"use client";

import { useParams } from "next/navigation";

export default function ForgotPassword() {
  const params = useParams();
  return (
    <div>
      <h1>Forgot Password</h1>
    </div>
  );
}
