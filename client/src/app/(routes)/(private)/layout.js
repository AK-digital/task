import AuthProvider from "@/app/AuthProvider";
import Header from "@/layouts/Header";

export default function PrivateLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
