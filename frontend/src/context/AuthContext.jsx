import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../auth/firebaseConfig";
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext();
const API_BASE_URL = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        Cookies.set("authToken", token, { expires: 7 });

        if (!currentUser) {
          // Ajoutez cette condition
          try {
            const response = await axios.get(
              `${API_BASE_URL}/users?email=${user.email}`
            );
            const userData = response.data.find((u) => u.email === user.email);

            if (userData) {
              setCurrentUser({
                ...user,
                name: userData.name,
                profile_picture: userData.profile_picture,
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
