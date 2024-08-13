import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../auth/firebaseConfig";
import Cookies from "js-cookie";

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const reloadUserData = useCallback(async (user) => {
    if (user) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users?email=${user.email}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const userData = data.find((u) => u.email === user.email);

        if (userData) {
          setCurrentUser({
            ...user,
            name: userData.name,
            profilePicture: userData.profilePicture,
          });
        } else {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCurrentUser(user);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        Cookies.set("authToken", token, { expires: 7 });
        await reloadUserData(user);
      } else {
        Cookies.remove("authToken");
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [reloadUserData]);

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, loading, reloadUserData }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
