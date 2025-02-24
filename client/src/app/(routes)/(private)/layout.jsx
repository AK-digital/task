"use server";
import AuthProvider from "@/app/AuthProvider";

export default async function PrivateLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
