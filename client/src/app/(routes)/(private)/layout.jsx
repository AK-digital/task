"use server";
import AuthProvider from "@/app/AuthProvider";
import Feedback from "@/shared/Feedback";

export default async function PrivateLayout({ children }) {
  return (
    <AuthProvider>
      {children}
      <Feedback />
    </AuthProvider>
  );
}
