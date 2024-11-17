import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useModal } from '../../hooks/useModal';
import Modal from './Modal';
import { LoadingButton } from './LoadingSpinner';
import {
    inviteUser,
    revokeUser,
    selectCurrentProject
} from '../../store/slices/projectSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { projectsApi } from '../../services/api/projects';

const InviteUsersDialog = () => {
    const appDispatch = useAppDispatch();
    const dispatch = useDispatch();
    const { hideModal } = useModal();

    const currentUser = useSelector(selectCurrentUser);
    const currentProject = useSelector(selectCurrentProject);
    const users = useSelector(state => state.projects.users);
    const isOpen = useSelector(state => state.ui.isInviteDialogOpen);

    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (currentProject?.guestUsers) {
            setSelectedUsers(currentProject.guestUsers);
        }
    }, [currentProject?.guestUsers]);

    const handleInviteUser = async (userId) => {
        try {
            setIsLoading(true);
            const user = users.find(u => u.id === userId);

            await appDispatch(
                inviteUser({
                    projectId: currentProject.id,
                    userId
                }),
                {
                    successMessage: `${user.name} a été invité au projet`,
                    errorMessage: "Erreur lors de l'invitation"
                }
            );

            // Envoyer l'email d'invitation
            if (user.email) {
                await projectsApi.inviteUserToProject(
                    currentProject.id,
                    user.email,
                    {
                        projectName: currentProject.name,
                        invitedBy: currentUser.name
                    }
                );
            }
        } catch (error) {
            console.error("Erreur lors de l'invitation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        try {
            await appDispatch(
                revokeUser({
                    projectId: currentProject.id,
                    userId
                }),
                {
                    successMessage: `${user.name} a été retiré du projet`,
                    errorMessage: "Erreur lors de la révocation"
                }
            );
        } catch (error) {
            console.error("Erreur lors de la révocation:", error);
        }
    };

    const filteredUsers = users
        .filter(user => user.id !== currentUser?.id)
        .filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    if (!isOpen) return null;

    return (
        <Modal
            title="Gestion des invités"
            onClose={hideModal}
            className="invite-users-dialog"
        >
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <ul className="user-list">
                {filteredUsers.map((user) => (
                    <li key={user.id} className="user-item">
                        <div className="user-item-profile">
                            <img
                                src={`/assets/img/${user.profilePicture}`}
                                className="user-avatar"
                                alt={user.name}
                            />
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                            </div>
                        </div>

                        {selectedUsers.includes(user.id) ? (
                            <LoadingButton
                                onClick={() => handleRevokeUser(user.id)}
                                className="revoke-btn"
                                isLoading={isLoading}
                            >
                                Révoquer
                            </LoadingButton>
                        ) : (
                            <LoadingButton
                                onClick={() => handleInviteUser(user.id)}
                                className="invite-btn"
                                isLoading={isLoading}
                            >
                                Inviter
                            </LoadingButton>
                        )}
                    </li>
                ))}

                {filteredUsers.length === 0 && (
                    <li className="no-results">
                        Aucun utilisateur trouvé
                    </li>
                )}
            </ul>
        </Modal>
    );
};

export default InviteUsersDialog;