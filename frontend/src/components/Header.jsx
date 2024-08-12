import React from "react";
import Select from "react-select";
import SignOut from "../auth/SignOut";

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
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--third-background-color)",
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
        <img
          src={
            currentUser && currentUser.profile_picture
              ? `/src/assets/img/${currentUser.profile_picture}`
              : "/src/assets/img/default-profile-pic.svg"
          }
          alt="Profile"
          className="profile-picture"
        />
        <SignOut />
      </div>
    </header>
  );
}
export default Header;
