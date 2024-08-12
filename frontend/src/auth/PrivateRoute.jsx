import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

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
        const response = await axios.get(`/api/users`);
        if (!response.status === 200 || response.data === null) {
          return;
        }

        const users = response.data;
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
