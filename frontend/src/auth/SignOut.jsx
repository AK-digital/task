import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { logout } from "../store/slices/authSlice";
import { clearProjects } from "../store/slices/projectSlice";
import { clearNotifications } from "../store/slices/notificationSlice";
import { addToast } from "../store/slices/uiSlice";

const SignOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await dispatch(logout()).unwrap();

      // Nettoyage du state
      dispatch(clearProjects());
      dispatch(clearNotifications());

      // Notification de succès
      dispatch(addToast({
        message: "Déconnexion réussie",
        type: "success"
      }));

      navigate("/signin");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      dispatch(addToast({
        message: "Erreur lors de la déconnexion",
        type: "error"
      }));
    }
  };

  return (
    <FontAwesomeIcon
      className="signout-icon"
      onClick={handleSignOut}
      icon={faSignOutAlt}
      title="Se déconnecter"
    />
  );
};

export default SignOut;