import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useModal } from "../hooks/useModal";
import SignOut from "../auth/SignOut";
import Notifications from "./Notifications";
import {
    setCurrentProject,
    createProject,
    setIsCreatingProject,
    selectProjects,
    selectIsCreatingProject,
    selectCurrentProject,
    updateUserProfile
} from '../store/slices/projectSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import {
    selectNotifications,
    fetchNotifications,
    markNotificationAsSeen
} from '../store/slices/notificationSlice';
import { validators } from '../utils/validators';
import { formatters } from '../utils/formatters';

const DEFAULT_PROFILE_PIC = "/assets/img/default-profile-pic.svg";

function Header() {
    const appDispatch = useAppDispatch();
    const dispatch = useDispatch();
    const { showConfirmation } = useModal();

    const currentUser = useSelector(selectCurrentUser);
    const projects = useSelector(selectProjects);
    const currentProject = useSelector(selectCurrentProject);
    const isCreatingProject = useSelector(selectIsCreatingProject);
    const notifications = useSelector(selectNotifications);

    const [newProjectName, setNewProjectName] = useState("");
    const [profilePicture, setProfilePicture] = useState(DEFAULT_PROFILE_PIC);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchNotifications(currentUser.id));
        }
    }, [currentUser, dispatch]);

    useEffect(() => {
        if (currentUser?.profilePicture) {
            setProfilePicture(getProfileImage(currentUser));
        }
    }, [currentUser]);

    const projectOptions = projects.map((project) => ({
        value: project.id,
        label: formatters.truncateText(project.name, 30)
    }));

    const handleProjectChange = async (selectedOption) => {
        const selectedProject = projects.find(p => p.id === selectedOption.value);
        dispatch(setCurrentProject(selectedProject));

        if (currentUser) {
            await appDispatch(updateUserProfile({
                userId: currentUser.id,
                updates: { currentProjectId: selectedOption.value }
            }), {
                successMessage: "Projet actif mis à jour",
                errorMessage: "Erreur lors du changement de projet"
            });
        }
    };

    const handleCreateProject = async () => {
        const trimmedName = newProjectName.trim();
        if (!trimmedName || !currentUser) return;

        if (!validators.isValidProjectName(trimmedName)) {
            dispatch(addToast({
                message: "Le nom du projet doit faire au moins 3 caractères",
                type: "error"
            }));
            return;
        }

        await appDispatch(
            createProject({
                name: trimmedName,
                userId: currentUser.id
            }),
            {
                successMessage: "Projet créé avec succès",
                errorMessage: "Erreur lors de la création du projet"
            }
        );

        setNewProjectName("");
        dispatch(setIsCreatingProject(false));
    };

    const getProfileImage = (user) => {
        if (!user?.profilePicture) return DEFAULT_PROFILE_PIC;
        return user.profilePicture.startsWith('http')
            ? user.profilePicture
            : `/assets/img/${user.profilePicture}`;
    };

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "var(--third-background-color)",
            borderColor: state.isFocused
                ? "var(--accent-color)"
                : "var(--border-color)",
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
            color: "var(--text-color)"
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "var(--text-color)"
        })
    };

    return (
        <header className="app-header">
            <h1>täsk</h1>
            {projects?.length > 0 && (
                <div className="project-selector">
                    <span>Sélectionner un projet</span>
                    <Select
                        options={projectOptions}
                        value={projectOptions.find(
                            (option) => option.value === currentProject?.id
                        )}
                        onChange={handleProjectChange}
                        styles={customSelectStyles}
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
                            }}>
                                Annuler
                            </button>
                        </>
                    ) : (
                        <button onClick={() => dispatch(setIsCreatingProject(true))}>
                            Créer un projet
                        </button>
                    )}
                </div>
            )}

            <div className="user-profile">
                <Notifications
                    currentUser={currentUser}
                    notifications={notifications}
                    onNotificationSeen={(notificationId) =>
                        dispatch(markNotificationAsSeen(notificationId))
                    }
                />
                <span>{currentUser?.name || "Utilisateur"}</span>
                <img
                    src={profilePicture}
                    alt="Profile"
                    className="profile-picture"
                />
                <SignOut />
            </div>
        </header>
    );
}

export default Header;