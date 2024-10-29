import React, { useState, useEffect } from "react";
import Select from "react-select";
import SignOut from "../auth/SignOut";
import defaultProfilePic from "/assets/img/default-profile-pic.svg";
import api from "../services/api";

function Header({
  projects = [],
  currentProject,
  onProjectChange,
  onCreateProject,
  isCreatingProject,
  newProjectName,
  setNewProjectName,
  handleCreateProjectClick,
  handleCancelCreateProject,
  currentUser,
}) {
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);

  useEffect(() => {
    if (currentUser && currentUser.profilePicture) {
      setProfilePicture(`/assets/img/${currentUser.profilePicture}`);
    } else {
      setProfilePicture(defaultProfilePic);
    }
  }, [currentUser]);

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "var(--third-background-color)",
      borderColor: "var(--border-color)",
      "&:hover": {
        borderColor: "var(--accent-color)",
      },
      maxWidth: "280px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--third-background-color)",
      width: "fit-content",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "var(--primary-background-color)"
        : "var(--third-background-color)",
      color: "var(--text-color)",
      "&:hover": {
        backgroundColor: "var(--primary-background-color)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--text-color)",
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--text-color)",
    }),
  };

  const handleTestEmail = async () => {
    try {
      console.log('Envoi de la requête de test d\'email...');
      const response = await api.post("/test-email");
      console.log('Réponse complète du serveur:', response);
      console.log('Statut de la réponse:', response.status);
      console.log('Données de la réponse:', response.data);
      if (response.data && response.data.message) {
        alert(response.data.message);
      } else {
        alert(`Réponse reçue avec statut ${response.status}, mais sans message.`);
      }
    } catch (error) {
      console.error("Erreur détaillée lors de l'envoi de l'email de test:", error);
      if (error.response) {
        console.log('Données de l\'erreur:', error.response.data);
        console.log('Statut de l\'erreur:', error.response.status);
      }
      alert(error.response?.data?.error || "Erreur lors de l'envoi de l'email de test");
    }
  };

  return (
    <header className="app-header">
      <h1>täsk</h1>
      {projects && projects.length > 0 && (
        <div className="project-selector">
          <span>Sélectionner un projet</span>
          <Select
            options={projectOptions}
            value={projectOptions.find(
              (option) => option.value === currentProject?.id
            )}
            onChange={(selectedOption) =>
              onProjectChange({ target: { value: selectedOption.value } })
            }
            styles={customStyles}
            placeholder="Choisir un projet"
          />
          <span>OU</span>
          {isCreatingProject ? (
            <>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nom du projet"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onCreateProject();
                  }
                }}
              />
              <button onClick={onCreateProject}>Créer</button>
              <button onClick={handleCancelCreateProject}>Annuler</button>
            </>
          ) : (
            <button onClick={handleCreateProjectClick}>Créer un projet</button>
          )}
        </div>
      )}
      <div className="user-profile">
        <span>{currentUser ? currentUser.name : "Utilisateur"}</span>
        <img src={profilePicture} alt="Profile" className="profile-picture" />
        <SignOut />
        <button onClick={handleTestEmail} className="test-email-btn">
          Test Email
        </button>
      </div>
    </header>
  );
}
export default Header;
