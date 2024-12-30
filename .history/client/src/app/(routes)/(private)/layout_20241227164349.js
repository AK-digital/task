import AuthProvider from "@/app/AuthProvider";

export default function PrivateLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
