import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

function SignOut() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const token = Cookies.get("authToken");

      // Supprimer le token de l'utilisateur dans la base de données
      if (token) {
        try {
          await axios.put(`${API_BASE_URL}/users/${auth.currentUser.uid}`, {
            authToken: "",
          });
        } catch (dbError) {
          console.error(
            "Erreur lors de la suppression du token dans la base de données:",
            dbError
          );
        }
      }

      await signOut(auth);
      Cookies.remove("authToken");
      navigate("/signin");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <FontAwesomeIcon
      className="signout-icon"
      onClick={handleSignOut}
      icon={faSignOutAlt}
    />
  );
}

export default SignOut;
