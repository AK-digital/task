/* eslint-disable no-unused-vars */
import React from "react";
import "../../assets/css/userMentionModal.css";

const UserMentionModal = ({
	project,
	users,
	content,
	setContent,
	setIsMention,
	setMentionnedUsers,
}) => {
	const guests = project?.guestUsers;
	const fetchGuestsInfo = users.filter((user) => guests.includes(user?.id));

	function handleSelectedUser(user) {
		setContent(content + user?.name);
		setIsMention(false);
		setMentionnedUsers((prev) => [
			...prev,
			{ userId: user?.id, email: user?.email },
		]);
	}

	return (
		<div className="user-mention-modal">
			{/* List of users in the project */}
			<ul className="user-list">
				{fetchGuestsInfo.map((user) => {
					return (
						<li
							onClick={(e) => handleSelectedUser(user)}
							key={user?.id}
							data-user={user?.name}>
							<img
								loading="lazy"
								src={`./assets/img/${user?.profilePicture}`}
								alt={`${user?.name}-picture`}
							/>
							<span>{user?.name}</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default UserMentionModal;
