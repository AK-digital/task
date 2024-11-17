import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectCurrentProject } from '../../store/slices/projectSlice';
import { mentionUtils } from '../../utils/mentionUtils';

const UserMentionModal = ({ onSelect, onClose, filterCurrentUser = true }) => {
	const currentProject = useSelector(selectCurrentProject);
	const currentUser = useSelector(state => state.auth.currentUser);
	const allUsers = useSelector(state => state.projects.users);
	const modalRef = useRef(null);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Filtrer les utilisateurs selon plusieurs critères
	const filteredUsers = allUsers.filter(user => {
		const isInProject = currentProject?.guestUsers?.includes(user.id);
		const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const isNotCurrentUser = filterCurrentUser ? user.id !== currentUser?.id : true;

		return isInProject && matchesSearch && isNotCurrentUser;
	});

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		};

		const handleKeyDown = (event) => {
			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault();
					setSelectedIndex(prev =>
						prev < filteredUsers.length - 1 ? prev + 1 : 0
					);
					break;
				case 'ArrowUp':
					event.preventDefault();
					setSelectedIndex(prev =>
						prev > 0 ? prev - 1 : filteredUsers.length - 1
					);
					break;
				case 'Enter':
					event.preventDefault();
					if (filteredUsers[selectedIndex]) {
						handleSelectUser(filteredUsers[selectedIndex]);
					}
					break;
				case 'Escape':
					event.preventDefault();
					onClose();
					break;
				default:
					break;
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [filteredUsers.length, selectedIndex, onClose]);

	const handleSelectUser = (user) => {
		onSelect(user.name);
		onClose();
	};

	return (
		<div className="user-mention-modal" ref={modalRef}>
			<div className="search-container">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setSelectedIndex(0);
					}}
					placeholder="Rechercher un utilisateur..."
					className="mention-search-input"
					autoFocus
				/>
			</div>

			<ul className="user-list" role="listbox">
				{filteredUsers.map((user, index) => (
					<li
						key={user.id}
						className={`user-item ${index === selectedIndex ? 'selected' : ''}`}
						onClick={() => handleSelectUser(user)}
						role="option"
						aria-selected={index === selectedIndex}
					>
						<img
							loading="lazy"
							src={`/assets/img/${user.profilePicture}`}
							alt={`${user.name}-picture`}
							className="user-avatar"
						/>
						<div className="user-info">
							<span className="user-name">{user.name}</span>
							{user.email && (
								<span className="user-email">{user.email}</span>
							)}
						</div>
					</li>
				))}

				{filteredUsers.length === 0 && (
					<li className="no-results">
						Aucun utilisateur trouvé
					</li>
				)}
			</ul>
		</div>
	);
};

export default React.memo(UserMentionModal);