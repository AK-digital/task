// src/components/Notification.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notification = ({ notification, onSeen }) => {
	const dispatch = useDispatch();
	const date = new Date(notification?.date);
	const formattedDate = formatDistance(date, new Date(), {
		addSuffix: true,
		locale: fr
	});

	useEffect(() => {
		if (!notification?.seen) {
			onSeen();
		}
	}, [notification?.seen, onSeen]);

	return (
		<li
			data-seen={notification.seen}
			className="notification__item"
		>
			<div className="notification__header">
				<div className="notification__title">
					<span>{notification?.title}</span>
				</div>

				<div className="notification__date">
					<span>{formattedDate}</span>
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