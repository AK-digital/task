import React, { useEffect, useState } from "react";

const Notification = ({ notification, setNotificationSeen }) => {
	const [isSeen, setIsSeen] = useState(notification?.seen);
	const date = new Date(notification?.date);
	const theDate = date?.toLocaleDateString();
	const theHour = date?.toLocaleTimeString();

	useEffect(() => {
		if (!notification?.seen) {
			setNotificationSeen(notification?.id);
			setIsSeen(false);
		}
	}, [isSeen]);

	return (
		<li data-seen={isSeen} className="notification__item">
			<div className="notification__header">
				<div className="notification__title">
					<span>{notification?.title}</span>
				</div>

				<div className="notification__date">
					<span>{theDate + " " + theHour}</span>
				</div>
			</div>
			<div className="notification__task">
				<span>{notification?.task}</span>
			</div>
			<div className="notification__description">
				<span>{notification?.description}</span>
			</div>
		</li>
	);
};

export default Notification;
