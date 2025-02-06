"use client";

import { useParams } from "next/navigation";

export default function ForgotPassword() {
  const params = useParams();
  const { id } = params;
  const resetCode = id;

  return (
    <div>
      <form>
        <label htmlFor="email">Email:</label>

        <input type="email" id="email" name="email" required />

        <label htmlFor="newPassword">New Password:</label>
        <input type="password" id="newPassword" name="newPassword" required />

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
        />

        <button type="submit">Reset Password</button>
      </form>
      <h1>Forgot Password</h1>
    </div>
  );
}
