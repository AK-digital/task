import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch } from '../hooks/useAppDispatch';
import { dateUtils } from '../utils/dateUtils';
import {
	fetchNotifications,
	markNotificationAsSeen,
	selectUnseenNotificationsCount
} from '../store/slices/notificationSlice';
import { setNotificationsPanelOpen } from '../store/slices/uiSlice';

const Notification = React.memo(({ notification, onSeen }) => {
	useEffect(() => {
		if (!notification?.seen) {
			onSeen(notification.id);
		}
	}, [notification?.seen, onSeen, notification?.id]);

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
					<span>{dateUtils.formatRelative(notification?.date)}</span>
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
});

const Notifications = () => {
	const appDispatch = useAppDispatch();
	const dispatch = useDispatch();
	const notificationsPanelRef = useRef(null);

	const currentUser = useSelector(state => state.auth.currentUser);
	const notifications = useSelector(state => state.notifications.items);
	const isOpen = useSelector(state => state.ui.isNotificationsPanelOpen);
	const unseenCount = useSelector(selectUnseenNotificationsCount);

	useEffect(() => {
		if (currentUser) {
			dispatch(fetchNotifications(currentUser.id));
		}
	}, [currentUser, dispatch]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target)) {
				dispatch(setNotificationsPanelOpen(false));
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, dispatch]);

	const handleMarkAsSeen = async (notificationId) => {
		try {
			await appDispatch(
				markNotificationAsSeen(notificationId),
				{ showLoading: false }
			);
		} catch (error) {
			console.error("Erreur lors du marquage de la notification:", error);
		}
	};

	const filteredNotifications = notifications
		.filter(notification => notification.userId === currentUser?.id)
		.sort((a, b) => new Date(b.date) - new Date(a.date));

	return (
		<div className="notification" ref={notificationsPanelRef}>
			<div className="notification__logo">
				<FontAwesomeIcon
					icon={faBell}
					onClick={() => dispatch(setNotificationsPanelOpen(!isOpen))}
				/>
				{unseenCount > 0 && !isOpen && (
					<div>
						<span>{unseenCount}</span>
					</div>
				)}
			</div>
			{isOpen && (
				<div className="notification__modal">
					<ul className="notification__list">
						{filteredNotifications.map((notification) => (
							<Notification
								key={notification.id}
								notification={notification}
								onSeen={handleMarkAsSeen}
							/>
						))}
						{filteredNotifications.length === 0 && (
							<li className="notification__empty">
								Aucune notification
							</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

Notification.displayName = 'Notification';
export default React.memo(Notifications);