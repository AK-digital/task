import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "http://localhost:5001/api";

function SignOut() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const token = Cookies.get("authToken");

      if (token) {
        try {
          // Obtenir l'utilisateur à partir du token
          const userResponse = await fetch(
            `${API_BASE_URL}/users?authToken=${token}`
          );
          if (!userResponse.ok) {
            throw new Error(`HTTP error! status: ${userResponse.status}`);
          }
          const users = await userResponse.json();

          if (users.length > 0) {
            const user = users[0];
            // Mettre à jour le token de l'utilisateur
            const updateResponse = await fetch(
              `${API_BASE_URL}/users/${user.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ authToken: "" }),
              }
            );
            if (!updateResponse.ok) {
              throw new Error(`HTTP error! status: ${updateResponse.status}`);
            }
            console.log("Token supprimé avec succès de la base de données");
          } else {
            console.error("Aucun utilisateur trouvé avec ce token");
          }
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
