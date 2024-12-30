import AuthProvider from "@/app/AuthProvider";

export default function privateLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
