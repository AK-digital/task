import { AuthContext } from "@/context/auth";

export default function AuthProvider({ children }) {
  return <AuthContext.Provider>{children}</AuthContext.Provider>;
}
