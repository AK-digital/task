import React, { useEffect, useState } from "react";
import "../assets/css/notifications.css";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Notification from "./Notification";

const Notifications = ({ currentUser, notifications, setNotificationSeen }) => {
	const [isOpen, setIsOpen] = useState(false);

	const userNotifications = notifications?.filter(
		(notification) => notification?.userId === currentUser?.id
	);

	const unSeenCounter = userNotifications?.filter(
		(notification) => notification?.seen === false
	).length;

	return (
		<div className="notification">
			<div className="notification__logo">
				<FontAwesomeIcon icon={faBell} onClick={(e) => setIsOpen(!isOpen)} />
				{unSeenCounter > 0 && !isOpen && (
					<div>
						<span>{unSeenCounter}</span>
					</div>
				)}
			</div>
			{isOpen && (
				<div className="notification__modal">
					<ul className="notification__list">
						{userNotifications?.map((notification, idx) => {
							return (
								<Notification
									key={idx}
									notification={notification}
									setNotificationSeen={setNotificationSeen}
								/>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
};

export default Notifications;
