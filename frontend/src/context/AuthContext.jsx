import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../auth/firebaseConfig";
import Cookies from "js-cookie";

const AuthContext = createContext();
const API_BASE_URL = "http://localhost:5001/api";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        Cookies.set("authToken", token, { expires: 7 });

        if (!currentUser) {
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
        }
      } else {
        Cookies.remove("authToken");
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
