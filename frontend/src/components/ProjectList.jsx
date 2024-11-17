import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createProject,
    updateProjectTitle,
    deleteProject,
    setCurrentProject,
    selectProjects,
    selectIsLoading,
    selectError,
    setIsCreatingProject
} from '../store/slices/projectSlice';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function ProjectList() {
    const dispatch = useDispatch();
    const projects = useSelector(selectProjects);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const currentUser = useSelector(state => state.auth.currentUser);
    const currentProject = useSelector(state => state.projects.currentProject);
    const isCreatingProject = useSelector(state => state.projects.isCreatingProject);

    const [newProjectName, setNewProjectName] = useState("");

    const handleProjectChange = async (selectedOption) => {
        const selectedProject = projects.find(p => p.id === selectedOption.value);
        dispatch(setCurrentProject(selectedProject));

        if (currentUser) {
            // Mise à jour du projet courant dans Firestore si nécessaire
            // Cette fonctionnalité pourrait être déplacée dans un thunk si besoin
            const userRef = doc(db, 'users', currentUser.id);
            await updateDoc(userRef, {
                currentProjectId: selectedOption.value
            });
        }
    };

    const handleCreateProject = async () => {
        if (currentUser && newProjectName.trim()) {
            await dispatch(createProject({
                name: newProjectName.trim(),
                userId: currentUser.id
            }));
            setNewProjectName("");
            dispatch(setIsCreatingProject(false));
        }
    };

    const handleUpdateProjectTitle = async (projectId, newTitle) => {
        await dispatch(updateProjectTitle({ projectId, newTitle }));
    };

    const handleDeleteProject = async (projectId) => {
        const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
        if (isConfirmed) {
            await dispatch(deleteProject(projectId));
        }
    };

    const projectOptions = projects.map(project => ({
        value: project.id,
        label: project.name
    }));

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: "var(--third-background-color)",
            borderColor: "var(--border-color)",
            "&:hover": {
                borderColor: "var(--accent-color)"
            },
            maxWidth: "280px"
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "var(--third-background-color)"
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "var(--accent-color)"
                : state.isFocused
                    ? "var(--secondary-background-color)"
                    : "var(--third-background-color)",
            color: "var(--text-color)",
            "&:hover": {
                backgroundColor: "var(--secondary-background-color)"
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "var(--text-color)"
        })
    };

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;

    return (
        <div className="project-selector">
            <span>Sélectionner un projet</span>
            <Select
                options={projectOptions}
                value={projectOptions.find(option => option.value === currentProject?.id)}
                onChange={handleProjectChange}
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
                                handleCreateProject();
                            }
                        }}
                    />
                    <button onClick={handleCreateProject}>Créer</button>
                    <button onClick={() => {
                        setNewProjectName("");
                        dispatch(setIsCreatingProject(false));
                    }}>Annuler</button>
                </>
            ) : (
                <button onClick={() => dispatch(setIsCreatingProject(true))}>
                    Créer un projet
                </button>
            )}

            {currentProject && projects.length > 0 && (
                <div className="project-actions">
                    <input
                        type="text"
                        value={currentProject.name}
                        onChange={(e) => handleUpdateProjectTitle(currentProject.id, e.target.value)}
                        onBlur={(e) => {
                            if (e.target.value !== currentProject.name) {
                                handleUpdateProjectTitle(currentProject.id, e.target.value);
                            }
                        }}
                    />
                    <button
                        onClick={() => handleDeleteProject(currentProject.id)}
                        className="delete-btn"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProjectList;