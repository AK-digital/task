import React, { useState, useEffect, useRef } from "react";
import "../../assets/css/invite-users-dialog.css";
import api from "../../services/api";

const InviteUsersDialog = ({
	isOpen,
	onClose,
	users,
	currentProject,
	currentUser,
	onInviteUser,
	onRevokeUser,
}) => {
	const [projectUsers, setProjectUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const dialogRef = useRef(null);

	useEffect(() => {
		if (currentProject && currentProject.guestUsers) {
			setProjectUsers(currentProject.guestUsers);
		}
	}, [currentProject]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dialogRef.current && !dialogRef.current.contains(event.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const filteredUsers = users.filter((user) => user.id !== currentUser.id);

	return (
		<div className="invite-users-dialog-overlay">
			<div className="invite-users-dialog" ref={dialogRef}>
				<button className="close-button" onClick={onClose}>
					&times;
				</button>
				<h2>Gestions des invités</h2>
				<ul className="user-list">
					{filteredUsers.map((user) => (
						<li key={user.id} className="user-item">
							<div className="user-item-profile">
								<img
									src={`/public/assets/img/${user.profilePicture}`}
									className="guest-avatar"
								/>
								<span>{user.name}</span>
							</div>
							{projectUsers.includes(user.id) ? (
								<button
									onClick={() => onRevokeUser(currentProject.id, user.id)}>
									Révoquer
								</button>
							) : (
								<button
									disabled={isLoading}
									onClick={async () => {
										setIsLoading(true);
										await onInviteUser(
											currentProject.id,
											user.id,
											user?.email,
											currentProject
										);
										setIsLoading(false);
									}}>
									Ajouter
								</button>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default InviteUsersDialog;
