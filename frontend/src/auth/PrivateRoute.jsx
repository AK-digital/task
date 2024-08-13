import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:5001/api";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const authToken = Cookies.get("authToken");

      if (!authToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();

        if (!users) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const user = users.find((user) => user.authToken === authToken);

        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          Cookies.remove("authToken");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or any loading component
  }

  return isAuthenticated ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
