import { AuthContext } from "@/context/auth";

export default function AuthProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState([]);
  return <AuthContext.Provider>{children}</AuthContext.Provider>;
}
