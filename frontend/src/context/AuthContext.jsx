import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = Cookies.get("authToken");
    if (!token) return null;

    try {
      const { data } = await axios.get(`${API_BASE_URL}/users`);
      const user = data.find((u) => u.authToken === token);
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'utilisateur courant:",
        error
      );
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
